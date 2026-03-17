import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Extract readable text from various formats
function extractText(content: string, mimeType: string): string {
  if (mimeType === "text/html" || content.trim().startsWith("<")) {
    // Strip HTML tags but preserve structure
    return content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&eacute;/g, "é")
      .replace(/&egrave;/g, "è")
      .replace(/&agrave;/g, "à")
      .replace(/\s{3,}/g, "\n\n")
      .trim();
  }
  return content;
}

function extractTitle(content: string, mimeType: string, filename: string): string {
  if (mimeType === "text/html" || content.includes("<title>")) {
    const match = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (match) return match[1].trim();
    const h1 = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1) return h1[1].trim();
  }
  // Use filename without extension
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = formData.get("mode") as string || "note"; // "note" | "flashcards"
    const deckName = formData.get("deckName") as string || "";
    const cardCount = parseInt(formData.get("cardCount") as string || "15");

    if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) return NextResponse.json({ error: "Fichier trop grand (max 2 Mo)" }, { status: 400 });

    const allowedTypes = ["text/plain", "text/html", "text/markdown", "text/csv", "application/json"];
    const isText = allowedTypes.includes(file.type) || file.name.match(/\.(txt|html|htm|md|csv|json)$/i);
    if (!isText) return NextResponse.json({ error: "Format non supporté. Utilise .txt, .html, .md ou .csv" }, { status: 400 });

    const rawContent = await file.text();
    const cleanText = extractText(rawContent, file.type);
    const title = extractTitle(rawContent, file.type, file.name);

    // Truncate to avoid token limits
    const truncated = cleanText.length > 12000 ? cleanText.substring(0, 12000) + "..." : cleanText;

    if (mode === "note") {
      // Save as a note directly
      const htmlContent = cleanText
        .split("\n\n")
        .filter(p => p.trim())
        .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");

      const note = await prisma.note.create({
        data: { title, content: htmlContent, userId },
      });
      return NextResponse.json({ type: "note", noteId: note.id, title });
    }

    // Generate flashcards with AI
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY non configurée" }, { status: 500 });

    const prompt = `Tu es un expert en pédagogie. À partir du contenu de cours suivant, génère exactement ${cardCount} flashcards optimisées pour la répétition espacée.

Titre : "${title}"
Contenu :
${truncated}

Règles :
- 1 concept par carte, question précise au recto, réponse concise au verso
- Utilise $$formule$$ pour les équations LaTeX
- Couvre les définitions, formules, exemples importants
- Commence par les notions fondamentales

Réponds UNIQUEMENT avec du JSON valide :
{"flashcards": [{"front": "Question", "back": "Réponse"}]}`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://study-forge-swart.vercel.app",
        "X-Title": "StudyForge",
      },
      body: JSON.stringify({
        model: "openrouter/hunter-alpha",
        messages: [{ role: "user", content: prompt }],
        reasoning: { enabled: true },
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.json();
      return NextResponse.json({ error: "Erreur IA", details: err }, { status: 500 });
    }

    const aiData = await aiRes.json();
    const text = aiData.choices?.[0]?.message?.content || "{}";

    let flashcards: { front: string; back: string }[] = [];
    try {
      const parsed = JSON.parse(text);
      flashcards = parsed.flashcards || [];
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) flashcards = JSON.parse(m[0]).flashcards || [];
    }

    if (!flashcards.length) return NextResponse.json({ error: "Aucune carte générée" }, { status: 500 });

    // Create deck + cards
    const deck = await prisma.deck.create({
      data: { title: deckName || title, userId },
    });
    await prisma.flashcard.createMany({
      data: flashcards.map(f => ({ front: f.front, back: f.back, deckId: deck.id })),
    });

    return NextResponse.json({ type: "flashcards", deckId: deck.id, title: deck.title, count: flashcards.length });

  } catch (e: any) {
    console.error("[import]", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

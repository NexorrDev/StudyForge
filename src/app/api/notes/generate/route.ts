import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s{3,}/g, "\n\n").trim();
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  // PDF — use pdf-parse
  if (name.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  const raw = await file.text();

  // HTML
  if (name.match(/\.html?$/) || raw.trim().startsWith("<")) {
    return stripHtml(raw);
  }

  // Markdown, txt, csv — return as-is
  return raw;
}

async function callAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
      max_tokens: 8000,
    }),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function buildPrompt(title: string, subject: string, courseText: string, hasFile: boolean): string {
  const strictRule = hasFile
    ? `⚠️ RÈGLE ABSOLUE : Basez-vous UNIQUEMENT sur le contenu fourni. N'ajoutez RIEN qui ne soit pas explicitement dans ce cours. Pas de définitions supplémentaires, pas de formules inventées, pas de contexte extérieur.`
    : `Génère une fiche complète et pédagogique sur ce sujet.`;

  return `Tu es un expert en pédagogie. Génère une fiche de révision HTML visuelle.

Titre exact : "${title}"${subject ? `\nMatière : ${subject}` : ""}

${strictRule}

${courseText ? `=== CONTENU DU COURS ===\n${courseText.substring(0, 11000)}\n=== FIN ===` : ""}

EXIGENCES HTML :
- Document HTML complet avec <style> intégré (dark theme, bg #0a0a0f)
- Dans <head> : <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
- Fonts Google : Syne (titres 700/800) + DM Mono (code/formules)
- Couleurs : vert #6ee7b7 (définitions), violet #818cf8 (formules), rose #f472b6 (exemples)
- Structure fidèle au cours, mêmes sections dans le même ordre
- Formules : \\( ... \\) inline, \\[ ... \\] en bloc
- Cards colorées, tableaux récap, points clés
- <title> et <h1> = exactement "${title}"

Réponds UNIQUEMENT avec le code HTML, sans markdown.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as any).id;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY manquante" }, { status: 500 });

  let userTitle = "";
  let courseText = "";
  let subject = "";
  let hasFile = false;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    subject = (formData.get("subject") as string) || "";
    userTitle = (formData.get("topic") as string) || "";

    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Fichier trop grand (max 10 Mo)" }, { status: 400 });

    try {
      courseText = await extractTextFromFile(file);
    } catch (e: any) {
      return NextResponse.json({ error: `Impossible de lire le fichier : ${e.message}` }, { status: 400 });
    }

    if (!courseText.trim()) {
      return NextResponse.json({ error: "Le fichier semble vide ou illisible. Essaie un PDF avec du texte sélectionnable (non scanné)." }, { status: 400 });
    }

    hasFile = true;

    if (!userTitle) {
      userTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    }

  } else {
    const body = await req.json();
    userTitle = body.topic || "";
    courseText = body.content || "";
    subject = body.subject || "";
    hasFile = !!courseText;
  }

  if (!userTitle && !courseText) {
    return NextResponse.json({ error: "Sujet ou contenu requis" }, { status: 400 });
  }

  try {
    const prompt = buildPrompt(userTitle, subject, courseText, hasFile);
    let html = await callAI(prompt, apiKey);

    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    // Force the user's title
    if (userTitle) {
      html = html.replace(/<title[^>]*>[^<]*<\/title>/i, `<title>${userTitle}</title>`);
      html = html.replace(/<h1[^>]*>[^<]*<\/h1>/i, `<h1>${userTitle}</h1>`);
    }

    const note = await prisma.note.create({
      data: { title: userTitle, content: html, subject: subject || null, userId },
    });

    return NextResponse.json({ html, title: userTitle, noteId: note.id });

  } catch (e: any) {
    console.error("[generate-note]", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

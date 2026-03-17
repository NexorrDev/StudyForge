import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as any).id;

  const { topic, content, subject, save } = await req.json();
  if (!topic && !content) return NextResponse.json({ error: "Sujet ou contenu requis" }, { status: 400 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY manquante" }, { status: 500 });

  const prompt = `Tu es un expert en pédagogie et en création de fiches de révision visuelles et efficaces.

${content
  ? `À partir de ce cours :\n\n${content.substring(0, 10000)}`
  : `Génère une fiche de révision complète sur le sujet : "${topic}" (matière : ${subject || "général"})`
}

Génère une fiche de révision complète et structurée en HTML.

RÈGLES IMPÉRATIVES :
- HTML complet avec <style> intégré, dark theme élégant (#0a0a0f background)
- Structure : header avec titre, sections numérotées, définitions, formules, exemples, récapitulatif
- Utilise MathJax pour les formules : entoure les formules LaTeX avec \\( ... \\) inline ou \\[ ... \\] en bloc
- Ajoute ce script dans le <head> : <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
- Design : cards colorées, tableaux, mise en évidence des points clés
- Couleurs : vert émeraude #6ee7b7 pour définitions, violet #818cf8 pour formules, rose #f472b6 pour forces/vecteurs
- Fonts : importer Syne (titres) et DM Mono (formules) depuis Google Fonts
- Contenu dense et complet, minimum 5 sections
- Les formules mathématiques DOIVENT être en LaTeX dans les balises MathJax

Réponds UNIQUEMENT avec le code HTML complet, sans markdown, sans explication.`;

  try {
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
        temperature: 0.5,
        max_tokens: 8000,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: "Erreur IA", details: err }, { status: 500 });
    }

    const data = await res.json();
    let html = data.choices?.[0]?.message?.content || "";

    // Clean markdown code fences if present
    html = html.replace(/^```html\n?/i, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                       html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : (topic || "Fiche générée");

    // Save to DB if requested
    let noteId: string | null = null;
    if (save) {
      const note = await prisma.note.create({
        data: { title, content: html, subject: subject || null, userId },
      });
      noteId = note.id;
    }

    return NextResponse.json({ html, title, noteId });

  } catch (e: any) {
    console.error("[generate-note]", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

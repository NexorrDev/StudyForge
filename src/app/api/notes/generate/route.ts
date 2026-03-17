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
    ? `⚠️ RÈGLE ABSOLUE : Tu dois te baser UNIQUEMENT sur le contenu fourni ci-dessous. N'ajoute RIEN qui ne soit pas explicitement dans ce cours. Pas de définitions supplémentaires, pas de formules inventées, pas de contexte extérieur. Si une notion n'est pas dans le texte, ne la mets pas dans la fiche.`
    : `Génère une fiche complète et pédagogique sur ce sujet.`;

  return `Tu es un expert en pédagogie. Génère une fiche de révision HTML visuelle.

Titre exact de la fiche : "${title}"${subject ? `\nMatière : ${subject}` : ""}

${strictRule}

${courseText ? `=== CONTENU DU COURS (source unique) ===\n${courseText.substring(0, 11000)}\n=== FIN DU COURS ===` : ""}

EXIGENCES HTML :
- Document HTML complet avec <style> intégré (dark theme, bg #0a0a0f)
- Dans <head> : <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
- Fonts Google : Syne (titres 700/800) + DM Mono (code/formules)
- Couleurs thématiques : vert #6ee7b7 (définitions), violet #818cf8 (formules), rose #f472b6 (exemples)
- Structure fidèle au cours : reprends les mêmes sections, dans le même ordre
- Formules : \\( ... \\) inline, \\[ ... \\] en bloc
- Cards colorées, tableaux récap, points clés mis en valeur
- Le titre dans le <title> et le <h1> doit être exactement : "${title}"

Réponds UNIQUEMENT avec le code HTML complet, sans markdown.`;
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
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Fichier trop grand (max 5 Mo)" }, { status: 400 });

    const raw = await file.text();
    const isHtml = file.name.match(/\.html?$/i) || raw.trim().startsWith("<");
    courseText = isHtml ? stripHtml(raw) : raw;
    hasFile = true;

    // Only use filename as fallback if user gave no title
    if (!userTitle) {
      if (isHtml) {
        const m = raw.match(/<title[^>]*>([^<]+)<\/title>/i) || raw.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        userTitle = m ? m[1].replace(/<[^>]+>/g, "").trim() : file.name.replace(/\.[^.]+$/, "");
      } else {
        userTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      }
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

    // Clean markdown fences
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    // Always use the user's title — force-replace whatever the AI put
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

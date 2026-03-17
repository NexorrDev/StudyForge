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
      temperature: 0.45,
      max_tokens: 8000,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function buildPrompt(title: string, subject: string, courseText: string): string {
  return `Tu es un expert en pédagogie. Génère une fiche de révision HTML complète et visuelle.

Titre : "${title}"${subject ? `\nMatière : ${subject}` : ""}
${courseText ? `\nContenu du cours :\n${courseText.substring(0, 10000)}` : ""}

EXIGENCES HTML :
- Document HTML complet avec <style> intégré (dark theme, bg #0a0a0f)
- Ajoute dans <head> : <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
- Fonts Google : Syne (titres, 700/800) + DM Mono (code/formules)
- Couleurs : vert #6ee7b7 (définitions), violet #818cf8 (formules), rose #f472b6 (vecteurs/forces)
- Structure : header avec titre, 4-6 sections numérotées, cards colorées, formules, tableaux récap, pièges à éviter
- Formules mathématiques avec MathJax : \\( ... \\) inline, \\[ ... \\] en bloc
- Design soigné : border-radius, padding généreux, bonne typographie

Réponds UNIQUEMENT avec le code HTML complet, sans markdown ni explication.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as any).id;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY manquante" }, { status: 500 });

  let topicTitle = "";
  let courseText = "";
  let subject = "";
  let save = true;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // File upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    subject = (formData.get("subject") as string) || "";
    const customTitle = (formData.get("topic") as string) || "";
    save = formData.get("save") === "true";

    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Fichier trop grand (max 5 Mo)" }, { status: 400 });

    const raw = await file.text();
    const isHtml = file.name.match(/\.html?$/i) || raw.trim().startsWith("<");
    courseText = isHtml ? stripHtml(raw) : raw;
    courseText = courseText.substring(0, 12000);

    // Extract title from file
    if (customTitle) {
      topicTitle = customTitle;
    } else if (isHtml) {
      const m = raw.match(/<title[^>]*>([^<]+)<\/title>/i) || raw.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      topicTitle = m ? m[1].replace(/<[^>]+>/g, "").trim() : file.name.replace(/\.[^.]+$/, "");
    } else {
      topicTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    }

  } else {
    // JSON body
    const body = await req.json();
    topicTitle = body.topic || "";
    courseText = body.content || "";
    subject = body.subject || "";
    save = body.save !== false;
  }

  if (!topicTitle && !courseText) {
    return NextResponse.json({ error: "Sujet ou contenu requis" }, { status: 400 });
  }

  try {
    const prompt = buildPrompt(topicTitle, subject, courseText);
    let html = await callAI(prompt, apiKey);

    // Clean markdown fences
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                       html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const finalTitle = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
      : (topicTitle || "Fiche générée");

    let noteId: string | null = null;
    if (save) {
      const note = await prisma.note.create({
        data: { title: finalTitle, content: html, subject: subject || null, userId },
      });
      noteId = note.id;
    }

    return NextResponse.json({ html, title: finalTitle, noteId });

  } catch (e: any) {
    console.error("[generate-note]", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

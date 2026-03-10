import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { noteContent, noteTitle, count = 10 } = await request.json();
  if (!noteContent) return NextResponse.json({ error: "noteContent is required" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });

  const prompt = `Tu es un expert en pedagogie et en creation de flashcards efficaces pour la memorisation par repetition espacee.

A partir du contenu de cours suivant, genere exactement ${count} flashcards optimisees.
Titre : "${noteTitle}"
Contenu : ${noteContent}

Regles : 1 idee par carte, question precise au recto, reponse concise au verso, utilise LaTeX pour les equations.

Reponds UNIQUEMENT avec du JSON valide :
{"flashcards": [{"front": "Question", "back": "Reponse"}]}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-opus-4-5", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    try { return NextResponse.json(JSON.parse(text)); }
    catch { const m = text.match(/\{[\s\S]*\}/); return NextResponse.json(m ? JSON.parse(m[0]) : { flashcards: [] }); }
  } catch { return NextResponse.json({ error: "Failed to generate" }, { status: 500 }); }
}

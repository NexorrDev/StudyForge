import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { noteContent, noteTitle, count = 10 } = await request.json();
  if (!noteContent && !noteTitle)
    return NextResponse.json({ error: "Contenu requis" }, { status: 400 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: "OPENROUTER_API_KEY non configurée" }, { status: 500 });

  const prompt = `Tu es un expert en pédagogie et en création de flashcards pour la mémorisation par répétition espacée (SRS).

À partir du contenu de cours ci-dessous, génère exactement ${count} flashcards optimisées pour la mémorisation.

Titre du cours : "${noteTitle}"
Contenu : ${noteContent}

Règles strictes :
- 1 concept clé par carte (principe atomique)
- Recto : question précise ou terme à définir
- Verso : réponse concise et mémorisable (max 2 lignes)
- Utilise la notation LaTeX entre $$ pour les formules (ex: $$E = mc^2$$)
- Varie les types : définitions, formules, applications, exemples
- Commence par les concepts fondamentaux

Réponds UNIQUEMENT avec du JSON valide, sans markdown :
{"flashcards": [{"front": "Question", "back": "Réponse"}]}`;

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
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[generate] OpenRouter error:", err);
      return NextResponse.json({ error: "Erreur OpenRouter", details: err }, { status: 500 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";

    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      return NextResponse.json(m ? JSON.parse(m[0]) : { flashcards: [] });
    }
  } catch (e: any) {
    console.error("[generate] fetch error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

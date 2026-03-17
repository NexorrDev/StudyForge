"use client";
import { useState, useEffect } from "react";

interface CardData { id: string; front: string; back: string; }
interface Props { card: CardData; onRate: (r: 0|1|2|3) => void; }

function renderLatex(text: string, katexLoaded: boolean): string {
  if (!katexLoaded || typeof window === "undefined") return text.replace(/\n/g, "<br>");
  const w = window as any;
  let result = text;
  // Block $$...$$
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, expr) => {
    try { return `<div class="katex-block-rendered">${w.katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`; }
    catch { return `<code>${expr}</code>`; }
  });
  // Inline $...$
  result = result.replace(/\$([^$\n]+)\$/g, (_, expr) => {
    try { return `<span class="katex-inline-rendered">${w.katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })}</span>`; }
    catch { return `<code>${expr}</code>`; }
  });
  return result.replace(/\n/g, "<br>");
}

export function FlashCard({ card, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [katexLoaded, setKatexLoaded] = useState(false);

  useEffect(() => {
    const w = window as any;
    if (w.katex) { setKatexLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => setKatexLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleNext = (r: 0|1|2|3) => { setFlipped(false); setTimeout(() => onRate(r), 200); };

  const frontHtml = renderLatex(card.front, katexLoaded);
  const backHtml = renderLatex(card.back, katexLoaded);

  return (
    <>
      <style>{`
        .katex-block-rendered{display:block;text-align:center;margin:10px 0;padding:8px;background:rgba(6,214,232,0.05);border-radius:8px;overflow-x:auto;}
        .katex-inline-rendered{display:inline;padding:0 2px;}
        .katex{font-size:1.05em;}
      `}</style>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:28 }}>
        <div className="flip-card" style={{ width:"100%", maxWidth:520, height:"auto", minHeight:220, cursor:"pointer" }} onClick={() => !flipped && setFlipped(true)}>
          <div className={"flip-card-inner" + (flipped ? " flipped" : "")} style={{ minHeight:220 }}>
            <div className="flip-card-front" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              padding:"28px 32px 40px", background:"linear-gradient(135deg,var(--bg-card),var(--bg-card-hover))",
              border:"1px solid var(--border-bright)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)", minHeight:220 }}>
              <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"var(--text-muted)",
                fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, marginBottom:14 }}>Question</span>
              <div style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:18,
                textAlign:"center", color:"var(--text-primary)", lineHeight:1.5 }}
                dangerouslySetInnerHTML={{ __html: frontHtml }} />
              <span style={{ position:"absolute", bottom:12, fontSize:11, color:"var(--text-muted)" }}>🔄 Cliquer pour révéler</span>
            </div>
            <div className="flip-card-back" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              padding:"28px 32px", background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,214,232,0.08))",
              border:"1px solid var(--primary)", boxShadow:"0 20px 60px rgba(124,58,237,0.2)", minHeight:220 }}>
              <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"var(--primary-light)",
                fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, marginBottom:14 }}>Réponse</span>
              <div style={{ fontSize:15, textAlign:"center", color:"var(--text-primary)", lineHeight:1.7 }}
                dangerouslySetInnerHTML={{ __html: backHtml }} />
            </div>
          </div>
        </div>
        {flipped && (
          <div style={{ display:"flex", gap:10 }} className="animate-slide-up">
            {[
              { label:"✗ Raté",    rating:0 as 0|1|2|3, bg:"rgba(244,63,94,0.15)",  color:"var(--rose)",    border:"rgba(244,63,94,0.3)" },
              { label:"⚡ Difficile",rating:1 as 0|1|2|3,bg:"rgba(245,158,11,0.1)", color:"var(--amber)",   border:"rgba(245,158,11,0.25)" },
              { label:"👍 Bien",   rating:2 as 0|1|2|3, bg:"rgba(6,214,232,0.1)",   color:"var(--cyan)",    border:"rgba(6,214,232,0.25)" },
              { label:"✓ Sus !",   rating:3 as 0|1|2|3, bg:"rgba(16,185,129,0.15)", color:"var(--emerald)", border:"rgba(16,185,129,0.3)" },
            ].map(btn => (
              <button key={btn.label} onClick={() => handleNext(btn.rating)}
                style={{ padding:"10px 18px", borderRadius:12, fontFamily:"var(--font-syne,sans-serif)",
                  fontWeight:600, fontSize:13, cursor:"pointer", background:btn.bg, color:btn.color, border:`1px solid ${btn.border}`, transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}>
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

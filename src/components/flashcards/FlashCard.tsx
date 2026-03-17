"use client";
import { useState, useEffect } from "react";

interface CardData { id: string; front: string; back: string; }
interface Props { card: CardData; onRate: (r: 0|1|2|3) => void; }

function useKatex() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as any;
    if (w.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function renderMath(text: string, ready: boolean): string {
  if (!ready || typeof window === "undefined") return escapeHtml(text).replace(/\n/g, "<br>");
  const w = window as any;
  let out = text;
  // $$...$$ block (no s flag — use [\s\S] instead)
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
    try { return `<div class="kblock">${w.katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`; }
    catch { return `<code class="kfail">${expr}</code>`; }
  });
  // $...$ inline
  out = out.replace(/\$([^$\n]+?)\$/g, (_, expr) => {
    try { return `<span class="kinline">${w.katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })}</span>`; }
    catch { return `<code class="kfail">${expr}</code>`; }
  });
  out = out.replace(/\n/g, "<br>");
  return out;
}

function escapeHtml(t: string) {
  return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

export function FlashCard({ card, onRate }: Props) {
  const katexReady = useKatex();
  const [flipped, setFlipped] = useState(false);

  const frontHtml = renderMath(card.front, katexReady);
  const backHtml  = renderMath(card.back,  katexReady);

  const handleNext = (r: 0|1|2|3) => {
    setFlipped(false);
    setTimeout(() => onRate(r), 180);
  };

  return (
    <>
      <style>{`
        .kblock{display:block;text-align:center;margin:10px 0;padding:10px;background:rgba(6,214,232,0.05);border-radius:8px;overflow-x:auto;}
        .kinline{display:inline;}
        .kfail{color:var(--rose);font-family:monospace;font-size:12px;padding:1px 4px;background:rgba(244,63,94,0.1);border-radius:4px;}
        .katex{font-size:1.1em;}
        .flip-card-front,.flip-card-back{display:flex;flex-direction:column;align-items:center;justify-content:center;}
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>
        <div className="flip-card" style={{ width:"100%", maxWidth:540, minHeight:240, cursor:"pointer" }}
          onClick={() => !flipped && setFlipped(true)}>
          <div className={"flip-card-inner" + (flipped ? " flipped" : "")} style={{ minHeight:240 }}>
            {/* FRONT */}
            <div className="flip-card-front" style={{ padding:"28px 32px 44px", minHeight:240,
              background:"linear-gradient(135deg,var(--bg-card),var(--bg-card-hover))",
              border:"1px solid var(--border-bright)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
              <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em",
                color:"var(--text-muted)", fontFamily:"var(--font-syne,sans-serif)",
                fontWeight:700, marginBottom:14, flexShrink:0 }}>Question</span>
              <div style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:17,
                textAlign:"center", color:"var(--text-primary)", lineHeight:1.6, maxWidth:460 }}
                dangerouslySetInnerHTML={{ __html: frontHtml }} />
              <span style={{ position:"absolute", bottom:12, fontSize:11, color:"var(--text-muted)" }}>
                🔄 Cliquer pour révéler
              </span>
            </div>
            {/* BACK */}
            <div className="flip-card-back" style={{ padding:"28px 32px", minHeight:240,
              background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,214,232,0.08))",
              border:"1px solid var(--primary)", boxShadow:"0 20px 60px rgba(124,58,237,0.2)" }}>
              <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em",
                color:"var(--primary-light)", fontFamily:"var(--font-syne,sans-serif)",
                fontWeight:700, marginBottom:14, flexShrink:0 }}>Réponse</span>
              <div style={{ fontSize:15, textAlign:"center", color:"var(--text-primary)",
                lineHeight:1.7, maxWidth:460 }}
                dangerouslySetInnerHTML={{ __html: backHtml }} />
            </div>
          </div>
        </div>

        {flipped && (
          <div style={{ display:"flex", gap:10 }} className="animate-slide-up">
            {([
              { label:"✗ Raté",      r:0, bg:"rgba(244,63,94,0.15)",  c:"var(--rose)",    b:"rgba(244,63,94,0.3)"   },
              { label:"⚡ Difficile", r:1, bg:"rgba(245,158,11,0.1)", c:"var(--amber)",   b:"rgba(245,158,11,0.25)" },
              { label:"👍 Bien",     r:2, bg:"rgba(6,214,232,0.1)",   c:"var(--cyan)",    b:"rgba(6,214,232,0.25)"  },
              { label:"✓ Sus !",     r:3, bg:"rgba(16,185,129,0.15)", c:"var(--emerald)", b:"rgba(16,185,129,0.3)"  },
            ] as { label:string; r:0|1|2|3; bg:string; c:string; b:string }[]).map(btn => (
              <button key={btn.label} onClick={() => handleNext(btn.r)}
                style={{ padding:"10px 18px", borderRadius:12, fontFamily:"var(--font-syne,sans-serif)",
                  fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.15s",
                  background:btn.bg, color:btn.c, border:`1px solid ${btn.b}` }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

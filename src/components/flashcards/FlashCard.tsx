"use client";
import { useState } from "react";

interface CardData { id: string; front: string; back: string; }
interface Props { card: CardData; onRate: (r: 0|1|2|3) => void; }

export function FlashCard({ card, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);
  const handleNext = (r: 0|1|2|3) => { setFlipped(false); setTimeout(() => onRate(r), 200); };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:32 }}>
      <div className="flip-card" style={{ width:"100%", maxWidth:520, height:280, cursor:"pointer" }} onClick={() => setFlipped(!flipped)}>
        <div className={"flip-card-inner" + (flipped ? " flipped" : "")} style={{ height:"100%" }}>
          <div className="flip-card-front" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:32, background:"linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))",
            border:"1px solid var(--border-bright)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
            <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"var(--text-muted)",
              fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, marginBottom:16 }}>Question</span>
            <p style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:600, fontSize:20,
              textAlign:"center", color:"var(--text-primary)", lineHeight:1.4 }}>{card.front}</p>
            <span style={{ position:"absolute", bottom:16, fontSize:12, color:"var(--text-muted)" }}>🔄 Cliquer pour reveler</span>
          </div>
          <div className="flip-card-back" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:32, background:"linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,214,232,0.08))",
            border:"1px solid var(--primary)", boxShadow:"0 20px 60px rgba(124,58,237,0.2)" }}>
            <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"var(--primary-light)",
              fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, marginBottom:16 }}>Reponse</span>
            <p style={{ fontSize:16, textAlign:"center", color:"var(--text-primary)", lineHeight:1.6 }}>{card.back}</p>
          </div>
        </div>
      </div>
      {flipped && (
        <div style={{ display:"flex", gap:12 }} className="animate-slide-up">
          {[
            { label:"✗ A revoir", rating:0 as 0|1|2|3, bg:"rgba(244,63,94,0.15)", color:"var(--rose)", border:"rgba(244,63,94,0.3)" },
            { label:"⚡ Difficile", rating:1 as 0|1|2|3, bg:"rgba(245,158,11,0.1)", color:"var(--amber)", border:"rgba(245,158,11,0.25)" },
            { label:"👍 Bien", rating:2 as 0|1|2|3, bg:"rgba(6,214,232,0.1)", color:"var(--cyan)", border:"rgba(6,214,232,0.25)" },
            { label:"✓ Je sais !", rating:3 as 0|1|2|3, bg:"rgba(16,185,129,0.15)", color:"var(--emerald)", border:"rgba(16,185,129,0.3)" },
          ].map(btn => (
            <button key={btn.label} onClick={() => handleNext(btn.rating)}
              style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
                fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s",
                background:btn.bg, color:btn.color, border:`1px solid ${btn.border}` }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}>
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

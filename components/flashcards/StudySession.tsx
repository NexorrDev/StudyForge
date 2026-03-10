"use client";
import { useState, useEffect, useCallback } from "react";
import { FlashCard } from "./FlashCard";
import type { Rating } from "@/lib/sm2";

interface Card { id: string; front: string; back: string; }
interface Props { deckTitle: string; cards: Card[]; }

export function StudySession({ deckTitle, cards }: Props) {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState({ known:0, hard:0, review:0 });
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now()-startTime)/1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  const fmt = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  const handleRate = useCallback((r: Rating) => {
    setScores(s => ({ ...s, known: r>=2 ? s.known+1 : s.known, hard: r===1 ? s.hard+1 : s.hard, review: r===0 ? s.review+1 : s.review }));
    if (idx+1 >= cards.length) setDone(true);
    else setIdx(i => i+1);
  }, [idx, cards.length]);

  if (done) return (
    <div style={{ textAlign:"center", padding:64, borderRadius:16, border:"1px solid rgba(16,185,129,0.3)",
      background:"linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,214,232,0.08))" }} className="animate-card-appear">
      <div style={{ fontSize:64, marginBottom:24 }}>🎉</div>
      <h2 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:28, color:"var(--text-primary)", marginBottom:12 }}>Session terminee !</h2>
      <p style={{ color:"var(--text-secondary)", fontSize:16, marginBottom:32 }}>{cards.length} cartes en {fmt(elapsed)}</p>
      <div style={{ display:"flex", justifyContent:"center", gap:40, marginBottom:40 }}>
        {[{label:"Sus",v:scores.known,c:"var(--emerald)"},{label:"Difficile",v:scores.hard,c:"var(--amber)"},{label:"A revoir",v:scores.review,c:"var(--rose)"}].map(s => (
          <div key={s.label} style={{ textAlign:"center" }}>
            <p style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:36, color:s.c }}>{s.v}</p>
            <p style={{ fontSize:13, color:"var(--text-secondary)", marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <button onClick={() => { setIdx(0); setScores({known:0,hard:0,review:0}); setDone(false); }}
        style={{ padding:"12px 32px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
          fontWeight:700, fontSize:14, color:"white", cursor:"pointer", border:"none",
          background:"linear-gradient(135deg, var(--primary), var(--primary-light))" }}>
        Recommencer
      </button>
    </div>
  );

  const pct = Math.round((idx/cards.length)*100);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:4, fontFamily:"var(--font-syne, Syne), sans-serif" }}>{deckTitle}</p>
          <h2 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:26, color:"var(--text-primary)" }}>Session de revision</h2>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <span style={{ fontSize:13, fontFamily:"monospace", color:"var(--text-secondary)" }}>⏱ {fmt(elapsed)}</span>
          {[{l:"Sus",v:scores.known,c:"var(--emerald)"},{l:"Dur",v:scores.hard,c:"var(--amber)"},{l:"Revoir",v:scores.review,c:"var(--rose)"}].map(s => (
            <div key={s.l} style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:20, color:s.c, lineHeight:1 }}>{s.v}</p>
              <p style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-muted)", marginTop:2 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Carte {idx+1} sur {cards.length}</span>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--primary-light)" }}>{pct}%</span>
        </div>
        <div style={{ height:6, borderRadius:3, overflow:"hidden", background:"rgba(255,255,255,0.05)" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:3, transition:"width 0.5s ease",
            background:"linear-gradient(90deg, var(--primary), var(--cyan))", boxShadow:"0 0 8px var(--primary-glow)" }} />
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"center" }}>
        <div style={{ width:"100%", maxWidth:560 }}>
          <FlashCard key={idx} card={cards[idx]} onRate={handleRate} />
        </div>
      </div>
    </div>
  );
}

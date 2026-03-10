"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

type Rating = 0|1|2|3;

export default function StudyPage({ params }: { params: { id: string } }) {
  const [deck, setDeck] = useState<any>(null);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{flashcardId:string, rating:Rating}[]>([]);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    fetch(`/api/decks/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setDeck(d);
        const now = new Date();
        const due = (d.flashcards || []).filter((f: any) => {
          const rev = f.reviews?.[0];
          return !rev || new Date(rev.nextReview) <= now;
        });
        setDueCards(due.length > 0 ? due : (d.flashcards || []));
      });
  }, [params.id]);

  useEffect(() => {
    if (done) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now()-startTime)/1000)), 1000);
    return () => clearInterval(iv);
  }, [done, startTime]);

  const fmt = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  const handleRate = async (rating: Rating) => {
    const card = dueCards[idx];
    const newResults = [...results, { flashcardId: card.id, rating }];
    setResults(newResults);
    setFlipped(false);

    if (idx + 1 >= dueCards.length) {
      setSaving(true);
      const res = await fetch(`/api/decks/${params.id}/study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: newResults, duration: Math.floor((Date.now()-startTime)/1000) }),
      });
      const data = await res.json();
      setXpGained(data.xpGained || 0);
      setSaving(false);
      setDone(true);
    } else {
      setTimeout(() => setIdx(i => i+1), 150);
    }
  };

  if (!deck) return (
    <><AmbientBackground /><AppShell>
      <p style={{ color:"var(--text-secondary)", textAlign:"center", padding:60 }}>Chargement...</p>
    </AppShell></>
  );

  if (dueCards.length === 0) return (
    <><AmbientBackground /><AppShell>
      <div style={{ textAlign:"center", padding:80 }}>
        <p style={{ fontSize:60, marginBottom:20 }}>🎉</p>
        <h2 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:28, color:"var(--text-primary)", marginBottom:12 }}>Tout est a jour !</h2>
        <p style={{ color:"var(--text-secondary)", marginBottom:28 }}>Aucune carte a reviser dans ce deck.</p>
        <Link href={`/flashcards/${params.id}`} style={{ padding:"12px 28px", borderRadius:12, background:"var(--primary)", color:"white", textDecoration:"none", fontWeight:700 }}>Retour au deck</Link>
      </div>
    </AppShell></>
  );

  const known = results.filter(r => r.rating >= 2).length;
  const hard = results.filter(r => r.rating === 1).length;
  const missed = results.filter(r => r.rating === 0).length;
  const pct = Math.round((idx / dueCards.length) * 100);
  const card = dueCards[idx];

  if (done) return (
    <><AmbientBackground /><AppShell>
      <div style={{ maxWidth:520, margin:"0 auto", textAlign:"center", padding:"48px 0" }} className="animate-slide-up">
        <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
        <h2 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:28, color:"var(--text-primary)", marginBottom:8 }}>Session terminée !</h2>
        <p style={{ color:"var(--text-secondary)", marginBottom:8 }}>{dueCards.length} cartes en {fmt(elapsed)}</p>
        {xpGained > 0 && <p style={{ color:"var(--amber)", fontWeight:700, fontSize:16, marginBottom:24 }}>+{xpGained} XP gagnés ✨</p>}
        <div style={{ display:"flex", justifyContent:"center", gap:40, marginBottom:36, padding:24, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          {[{l:"Sus",v:known,c:"var(--emerald)"},{l:"Difficile",v:hard,c:"var(--amber)"},{l:"Raté",v:missed,c:"var(--rose)"}].map(s => (
            <div key={s.l}>
              <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:36, color:s.c }}>{s.v}</p>
              <p style={{ fontSize:13, color:"var(--text-secondary)", marginTop:4 }}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <Link href={`/flashcards/${params.id}/study`} style={{ padding:"12px 24px", borderRadius:12, background:"var(--primary)", color:"white", textDecoration:"none", fontWeight:700, fontFamily:"var(--font-syne,sans-serif)" }}>Recommencer</Link>
          <Link href="/dashboard" style={{ padding:"12px 24px", borderRadius:12, border:"1px solid var(--border)", background:"transparent", color:"var(--text-secondary)", textDecoration:"none", fontWeight:600, fontFamily:"var(--font-syne,sans-serif)" }}>Dashboard</Link>
        </div>
      </div>
    </AppShell></>
  );

  return (
    <><AmbientBackground /><AppShell>
      <div style={{ maxWidth:600, margin:"0 auto", display:"flex", flexDirection:"column", gap:28 }} className="animate-slide-up">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <Link href={`/flashcards/${params.id}`} style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none" }}>← {deck.title}</Link>
            <h2 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:22, color:"var(--text-primary)", marginTop:4 }}>Session de révision</h2>
          </div>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            <span style={{ fontSize:13, fontFamily:"monospace", color:"var(--text-secondary)" }}>⏱ {fmt(elapsed)}</span>
            {[{l:"✓",v:known,c:"var(--emerald)"},{l:"⚡",v:hard,c:"var(--amber)"},{l:"✗",v:missed,c:"var(--rose)"}].map(s => (
              <div key={s.l} style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:20, color:s.c, lineHeight:1 }}>{s.v}</p>
                <p style={{ fontSize:11, color:"var(--text-muted)" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Carte {idx+1} / {dueCards.length}</span>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--primary-light)" }}>{pct}%</span>
          </div>
          <div style={{ height:6, borderRadius:3, overflow:"hidden", background:"rgba(255,255,255,0.05)" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,var(--primary),var(--cyan))", borderRadius:3, transition:"width 0.4s ease", boxShadow:"0 0 8px var(--primary-glow)" }} />
          </div>
        </div>

        <div className="flip-card" style={{ width:"100%", height:280, cursor:"pointer" }} onClick={() => !flipped && setFlipped(true)}>
          <div className={"flip-card-inner" + (flipped ? " flipped" : "")} style={{ height:"100%" }}>
            <div className="flip-card-front" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:36, background:"linear-gradient(135deg,var(--bg-card),var(--bg-card-hover))", border:"1px solid var(--border-bright)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
              <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"var(--text-muted)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, marginBottom:16 }}>Question</span>
              <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:20, textAlign:"center", color:"var(--text-primary)", lineHeight:1.4 }}>{card.front}</p>
              <span style={{ position:"absolute", bottom:16, fontSize:12, color:"var(--text-muted)" }}>🔄 Cliquer pour révéler</span>
            </div>
            <div className="flip-card-back" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:36, background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,214,232,0.08))", border:"1px solid var(--primary)", boxShadow:"0 20px 60px rgba(124,58,237,0.2)" }}>
              <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"var(--primary-light)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, marginBottom:16 }}>Réponse</span>
              <p style={{ fontSize:17, textAlign:"center", color:"var(--text-primary)", lineHeight:1.6 }}>{card.back}</p>
            </div>
          </div>
        </div>

        {flipped && (
          <div style={{ display:"flex", gap:12, justifyContent:"center" }} className="animate-slide-up">
            {[
              { label:"✗ Raté",    rating:0 as Rating, bg:"rgba(244,63,94,0.15)",  color:"var(--rose)",    border:"rgba(244,63,94,0.3)" },
              { label:"⚡ Difficile",rating:1 as Rating,bg:"rgba(245,158,11,0.1)", color:"var(--amber)",   border:"rgba(245,158,11,0.25)" },
              { label:"👍 Bien",   rating:2 as Rating, bg:"rgba(6,214,232,0.1)",   color:"var(--cyan)",    border:"rgba(6,214,232,0.25)" },
              { label:"✓ Sus !",   rating:3 as Rating, bg:"rgba(16,185,129,0.15)", color:"var(--emerald)", border:"rgba(16,185,129,0.3)" },
            ].map(btn => (
              <button key={btn.label} onClick={() => handleRate(btn.rating)} disabled={saving}
                style={{ padding:"11px 22px", borderRadius:12, fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13, cursor:"pointer", background:btn.bg, color:btn.color, border:`1px solid ${btn.border}`, transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}>
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell></>
  );
}

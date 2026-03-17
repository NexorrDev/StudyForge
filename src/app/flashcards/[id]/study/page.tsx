"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { FlashCard } from "@/components/flashcards/FlashCard";

type Rating = 0|1|2|3;

export default function StudyPage({ params }: { params: { id: string } }) {
  const [deck, setDeck]       = useState<any>(null);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [idx, setIdx]         = useState(0);
  const [results, setResults] = useState<{flashcardId:string, rating:Rating}[]>([]);
  const [done, setDone]       = useState(false);
  const [startTime]           = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving]   = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    fetch(`/api/decks/${params.id}`).then(r => r.json()).then(d => {
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

    if (idx + 1 >= dueCards.length) {
      setSaving(true);
      const res = await fetch(`/api/decks/${params.id}/study`, {
        method:"POST", headers:{"Content-Type":"application/json"},
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
        <h2 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:28, color:"var(--text-primary)", marginBottom:12 }}>Tout est à jour !</h2>
        <p style={{ color:"var(--text-secondary)", marginBottom:28 }}>Aucune carte à réviser dans ce deck.</p>
        <Link href={`/flashcards/${params.id}`} style={{ padding:"12px 28px", borderRadius:12, background:"var(--primary)", color:"white", textDecoration:"none", fontWeight:700 }}>Retour au deck</Link>
      </div>
    </AppShell></>
  );

  const known  = results.filter(r => r.rating >= 2).length;
  const hard   = results.filter(r => r.rating === 1).length;
  const missed = results.filter(r => r.rating === 0).length;
  const pct    = Math.round((idx / dueCards.length) * 100);

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
      <div style={{ maxWidth:620, margin:"0 auto", display:"flex", flexDirection:"column", gap:28 }} className="animate-slide-up">
        {/* Header */}
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

        {/* Progress bar */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Carte {idx+1} / {dueCards.length}</span>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--primary-light)" }}>{pct}%</span>
          </div>
          <div style={{ height:6, borderRadius:3, overflow:"hidden", background:"rgba(255,255,255,0.05)" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,var(--primary),var(--cyan))", borderRadius:3, transition:"width 0.4s ease", boxShadow:"0 0 8px var(--primary-glow)" }} />
          </div>
        </div>

        {/* Use FlashCard component — handles KaTeX rendering */}
        <FlashCard
          key={idx}
          card={dueCards[idx]}
          onRate={handleRate}
        />
      </div>
    </AppShell></>
  );
}

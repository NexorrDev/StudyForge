import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { DeckCard } from "@/components/dashboard/DeckCard";
import Link from "next/link";

const DECKS = [
  { id:"1", title:"Mecanique Quantique", subject:"Physique", cards:64, due:7, progress:72, color:"#7C3AED" },
  { id:"2", title:"Analyse Complexe", subject:"Maths", cards:48, due:3, progress:55, color:"#06D6E8" },
  { id:"3", title:"Thermodynamique", subject:"Chimie", cards:36, due:0, progress:90, color:"#10B981" },
  { id:"4", title:"Histoire Moderne", subject:"Histoire", cards:52, due:2, progress:40, color:"#F59E0B" },
  { id:"5", title:"Optique Geometrique", subject:"Physique", cards:28, due:5, progress:65, color:"#F43F5E" },
  { id:"6", title:"Algebre Lineaire", subject:"Maths", cards:40, due:0, progress:80, color:"#8B5CF6" },
];

const FILTERS = ["Tous","Physique","Maths","Chimie","Histoire","A reviser"];

export default function FlashcardsPage() {
  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:32, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <h1 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:36, color:"var(--text-primary)" }}>Flashcards</h1>
              <p style={{ marginTop:8, color:"var(--text-secondary)" }}>{DECKS.length} decks · {DECKS.reduce((a,d)=>a+d.due,0)} cartes a reviser</p>
            </div>
            <Link href="/flashcards/new" style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
              fontWeight:700, fontSize:13, color:"white", textDecoration:"none",
              background:"linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow:"0 4px 20px var(--primary-glow)" }}>
              ✦ Nouveau deck
            </Link>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:20, borderRadius:16,
            background:"linear-gradient(135deg, rgba(244,63,94,0.1), rgba(245,158,11,0.08))", border:"1px solid rgba(244,63,94,0.3)" }}>
            <div>
              <p style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:17, color:"var(--text-primary)" }}>⚡ 17 cartes a reviser maintenant</p>
              <p style={{ fontSize:13, marginTop:4, color:"var(--text-secondary)" }}>5 minutes suffisent pour garder ton score SRS optimal</p>
            </div>
            <Link href="/flashcards/1/study" style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
              fontWeight:700, fontSize:13, color:"white", textDecoration:"none", flexShrink:0,
              background:"linear-gradient(135deg, var(--rose), #FF6B8A)" }}>
              Reviser →
            </Link>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {FILTERS.map((f, i) => (
              <button key={f} style={{ padding:"8px 16px", borderRadius:20, fontSize:13,
                fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:600, cursor:"pointer",
                background: i===0 ? "var(--primary)" : "var(--bg-card)",
                color: i===0 ? "white" : "var(--text-secondary)",
                border: `1px solid ${i===0 ? "var(--primary)" : "var(--border)"}` }}>{f}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {DECKS.map((d, i) => <DeckCard key={d.id} {...d} delay={i * 60} />)}
          </div>
        </div>
      </AppShell>
    </>
  );
}

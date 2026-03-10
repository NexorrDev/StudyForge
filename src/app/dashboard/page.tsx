import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { XPBar } from "@/components/dashboard/XPBar";
import { WeeklyHeatmap } from "@/components/dashboard/WeeklyHeatmap";
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

const UPCOMING = [
  { label:"Dans 1h", count:4, color:"var(--rose)" },
  { label:"Ce soir", count:8, color:"var(--amber)" },
  { label:"Demain", count:15, color:"var(--cyan)" },
  { label:"Cette semaine", count:32, color:"var(--primary-light)" },
];

const BADGES = ["🎯 100 cartes","🔥 7 jours","⚡ 1h etude","🏆 Top Physique","🌟 Serie parfaite"];

export default function DashboardPage() {
  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:32, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <h1 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:36, color:"var(--text-primary)", lineHeight:1.2 }}>
                Bonjour, Alex 👋
              </h1>
              <p style={{ marginTop:8, fontSize:15, color:"var(--text-secondary)" }}>
                Tu as <span style={{ color:"var(--rose)", fontWeight:600 }}>12 cartes</span> a reviser aujourd'hui.
              </p>
            </div>
            <Link href="/notes/new" style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px",
              borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:13,
              color:"white", textDecoration:"none", background:"linear-gradient(135deg, var(--primary), var(--primary-light))",
              boxShadow:"0 4px 20px var(--primary-glow)" }}>
              ✦ Creer une fiche
            </Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <StreakBadge days={14} />
            <XPBar current={2340} max={3000} level={12} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            <StatCard label="Cartes apprises" value={847} icon="✓" color="var(--emerald)" delay={0} />
            <StatCard label="A reviser" value={12} icon="⚡" color="var(--rose)" suffix=" auj." delay={100} />
            <StatCard label="Temps etude" value={24} icon="📊" color="var(--cyan)" suffix="h/mois" delay={200} />
            <StatCard label="Fiches creees" value={38} icon="📖" color="var(--primary)" delay={300} />
          </div>
          <div style={{ display:"grid", gap:24, gridTemplateColumns:"1fr 300px" }}>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h2 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:16, color:"var(--text-primary)" }}>Mes decks</h2>
                <Link href="/flashcards" style={{ fontSize:13, fontWeight:600, color:"var(--primary-light)", textDecoration:"none" }}>Voir tout →</Link>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {DECKS.map((d, i) => <DeckCard key={d.id} {...d} delay={i * 80} />)}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ padding:20, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
                <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:14, marginBottom:16, color:"var(--text-primary)" }}>Activite cette semaine</h3>
                <WeeklyHeatmap />
              </div>
              <div style={{ padding:20, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
                <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:14, marginBottom:14, color:"var(--text-primary)" }}>Revisions a venir</h3>
                {UPCOMING.map((item, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0",
                    borderBottom: i < UPCOMING.length-1 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize:13, color:"var(--text-secondary)" }}>{item.label}</span>
                    <span style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:15, color:item.color }}>{item.count} cartes</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:20, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
                <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:14, marginBottom:14, color:"var(--text-primary)" }}>Succes recents</h3>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {BADGES.map(b => (
                    <span key={b} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, fontFamily:"var(--font-syne, Syne), sans-serif",
                      fontWeight:600, background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", color:"var(--primary-light)" }}>{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}

import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatsCharts } from "@/components/stats/StatsCharts";

export default function StatsPage() {
  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:32, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div>
            <h1 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:36, color:"var(--text-primary)" }}>Statistiques</h1>
            <p style={{ marginTop:8, color:"var(--text-secondary)" }}>Ta progression et tes performances detaillees</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            <StatCard label="Total cartes vues" value={3248} icon="🧠" color="var(--primary)" delay={0} />
            <StatCard label="Taux de reussite" value={78} icon="🏆" color="var(--amber)" suffix="%" delay={100} />
            <StatCard label="Jours d'activite" value={31} icon="🔥" color="var(--rose)" delay={200} />
          </div>
          <StatsCharts />
        </div>
      </AppShell>
    </>
  );
}

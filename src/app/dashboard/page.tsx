"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { XPBar } from "@/components/dashboard/XPBar";
import { WeeklyHeatmap } from "@/components/dashboard/WeeklyHeatmap";
import { DeckCard } from "@/components/dashboard/DeckCard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then(r => r.json()),
      fetch("/api/decks").then(r => r.json()),
    ]).then(([s, d]) => {
      setStats(s);
      setDecks(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const UPCOMING = [
    { label: "Maintenant", count: stats?.stats?.dueCards || 0, color: "var(--rose)" },
    { label: "Ce mois", count: stats?.stats?.totalCards || 0, color: "var(--primary-light)" },
  ];

  if (loading) return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, animation: "streakFlame 1s infinite" }}>🧠</div>
            <p style={{ color: "var(--text-secondary)" }}>Chargement...</p>
          </div>
        </div>
      </AppShell>
    </>
  );

  const firstName = session?.user?.name?.split(" ")[0] || "toi";
  const dueCards = stats?.stats?.dueCards || 0;

  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 32, position: "relative", zIndex: 1 }} className="animate-slide-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: 36, color: "var(--text-primary)", lineHeight: 1.2 }}>
                Bonjour, {firstName} 👋
              </h1>
              <p style={{ marginTop: 8, fontSize: 15, color: "var(--text-secondary)" }}>
                {dueCards > 0
                  ? <>Tu as <span style={{ color: "var(--rose)", fontWeight: 600 }}>{dueCards} cartes</span> a reviser maintenant.</>
                  : "Tout est a jour ! Continue comme ca 🎉"}
              </p>
            </div>
            <Link href="/notes/new" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 13, color: "white", textDecoration: "none", background: "linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow: "0 4px 20px var(--primary-glow)" }}>
              ✦ Creer une fiche
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <StreakBadge days={stats?.user?.streak || 0} />
            <XPBar current={stats?.user?.xp || 0} max={Math.pow(((stats?.user?.level || 1)) * 10, 2)} level={stats?.user?.level || 1} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            <StatCard label="Cartes apprises" value={stats?.stats?.totalCards || 0} icon="✓" color="var(--emerald)" delay={0} />
            <StatCard label="A reviser" value={stats?.stats?.dueCards || 0} icon="⚡" color="var(--rose)" suffix=" auj." delay={100} />
            <StatCard label="Temps etude" value={stats?.stats?.totalStudyTime || 0} icon="📊" color="var(--cyan)" suffix="h" delay={200} />
            <StatCard label="Fiches creees" value={stats?.stats?.notesCount || 0} icon="📖" color="var(--primary)" delay={300} />
          </div>

          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 300px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Mes decks</h2>
                <Link href="/flashcards" style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-light)", textDecoration: "none" }}>Voir tout →</Link>
              </div>
              {decks.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", borderRadius: 16, border: "1px dashed var(--border)" }}>
                  <p style={{ fontSize: 32, marginBottom: 12 }}>🃏</p>
                  <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Aucun deck pour le moment</p>
                  <Link href="/flashcards/new" style={{ padding: "10px 20px", borderRadius: 12, background: "var(--primary)", color: "white", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>Creer mon premier deck</Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {decks.slice(0, 6).map((d: any, i: number) => (
                    <DeckCard key={d.id} id={d.id} title={d.title} subject={d.subject || ""} cards={d.total} due={d.due} progress={d.progress} color={d.color} delay={i * 80} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 20, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h3 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-primary)" }}>Activite cette semaine</h3>
                <WeeklyHeatmap data={stats?.weeklyActivity} />
              </div>
              <div style={{ padding: 20, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h3 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text-primary)" }}>Revisions a venir</h3>
                {UPCOMING.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < UPCOMING.length-1 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.label}</span>
                    <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 15, color: item.color }}>{item.count} cartes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}

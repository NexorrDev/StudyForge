import Link from "next/link";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function LandingPage() {
  const features = [
    { icon: "🃏", title: "SRS Intelligent", desc: "Algorithme SM-2 qui optimise tes revisions au moment parfait" },
    { icon: "∑", title: "LaTeX & Equations", desc: "Support natif des formules mathematiques, physiques et chimiques" },
    { icon: "🔥", title: "Gamification", desc: "Streaks, XP, niveaux et succes pour rester motive chaque jour" },
  ];
  return (
    <>
      <AmbientBackground />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", position: "relative", zIndex: 1, padding: "0 24px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
          borderRadius: 20, marginBottom: 32, background: "rgba(124,58,237,0.15)",
          border: "1px solid rgba(124,58,237,0.3)", color: "var(--primary-light)",
          fontSize: 12, fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 600 }}>
          ✦ Revision nouvelle generation · SRS · IA integree
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, fontSize: 32,
            background: "linear-gradient(135deg, var(--primary), var(--cyan))",
            boxShadow: "0 8px 32px var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            🧠
          </div>
          <h1 style={{ fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 800, fontSize: 64, color: "var(--text-primary)", lineHeight: 1 }}>
            StudyForge
          </h1>
        </div>
        <p style={{ fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 700, fontSize: 24,
          color: "var(--text-primary)", marginBottom: 16, maxWidth: 600 }}>
          Memorise plus vite. Oublie moins souvent.
        </p>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 48, maxWidth: 480 }}>
          Flashcards intelligentes, repetition espacee SM-2, editeur LaTeX integre et gamification
          pour transformer ta facon d'etudier.
        </p>
        <div style={{ display: "flex", gap: 16, marginBottom: 80 }}>
          <Link href="/dashboard" style={{ padding: "14px 32px", borderRadius: 12, fontFamily: "var(--font-syne, Syne), sans-serif",
            fontWeight: 700, fontSize: 15, color: "white", textDecoration: "none", transition: "all 0.2s",
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            boxShadow: "0 6px 24px var(--primary-glow)" }}>
            ▶ Commencer gratuitement
          </Link>
          <Link href="/dashboard" style={{ padding: "14px 32px", borderRadius: 12, fontFamily: "var(--font-syne, Syne), sans-serif",
            fontWeight: 600, fontSize: 15, color: "var(--text-secondary)", textDecoration: "none",
            background: "transparent", border: "1px solid var(--border)" }}>
            Voir la demo →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 720, width: "100%" }}>
          {features.map(f => (
            <div key={f.title} style={{ padding: 24, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

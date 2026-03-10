interface Props { current: number; max: number; level: number; }

export function XPBar({ current, max, level }: Props) {
  const pct = Math.round((current / max) * 100);
  const titles = ["Debutant","Apprenti","Etudiant","Erudit","Expert","Maitre","Legende"];
  const title = titles[Math.min(level - 1, titles.length - 1)];
  return (
    <div style={{ padding: 16, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--primary), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 800, fontSize: 13, color: "white" }}>{level}</div>
          <div>
            <p style={{ fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Niveau {level}</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{title} Erudit</p>
          </div>
        </div>
        <span style={{ fontSize: 12, color: "var(--primary-light)", fontWeight: 600 }}>{current} / {max} XP</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4,
          background: "linear-gradient(90deg, var(--primary), var(--cyan))",
          boxShadow: "0 0 10px var(--primary-glow)", transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

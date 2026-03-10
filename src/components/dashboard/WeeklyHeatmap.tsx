"use client";
const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const VALS = [85, 60, 100, 45, 90, 30, 70];

export function WeeklyHeatmap() {
  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: "100%", height: 36, borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
              background: `rgba(124,58,237,${VALS[i] / 100 * 0.75 + 0.05})`,
              border: VALS[i] === 100 ? "1px solid var(--primary)" : "1px solid transparent",
              boxShadow: VALS[i] === 100 ? "0 0 12px var(--primary-glow)" : "none" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scaleY(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scaleY(1)"; }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{d}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, marginTop: 10, textAlign: "center", color: "var(--text-muted)" }}>
        Objectif quotidien : 20 cartes
      </p>
    </div>
  );
}

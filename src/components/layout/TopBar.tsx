"use client";
import { useState } from "react";

export function TopBar() {
  const [q, setQ] = useState("");
  return (
    <header style={{ position: "fixed", top: 0, right: 0, left: 220, zIndex: 40,
      display: "flex", alignItems: "center", gap: 16, padding: "10px 24px",
      background: "rgba(6,6,12,0.8)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Recherche globale... (Cmd+K)"
          style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12,
            color: "var(--text-primary)", fontSize: 13, outline: "none", padding: "9px 16px 9px 40px",
            fontFamily: "var(--font-dm-sans, DM Sans), sans-serif" }}
          onFocus={e => { e.target.style.borderColor = "var(--border-bright)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; }} />
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20,
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <span style={{ animation: "streakFlame 1.5s ease-in-out infinite", display: "inline-block" }}>🔥</span>
          <span style={{ fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 700, color: "var(--amber)", fontSize: 14 }}>14</span>
        </div>
      </div>
    </header>
  );
}

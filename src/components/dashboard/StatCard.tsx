"use client";
import { useEffect, useState } from "react";

interface Props { label: string; value: number; icon: string; color: string; suffix?: string; delay?: number; }

export function StatCard({ label, value, icon, color, suffix = "", delay = 0 }: Props) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s = 0;
      const step = (value / 1200) * 16;
      const iv = setInterval(() => {
        s = Math.min(s + step, value);
        setN(Math.floor(s));
        if (s >= value) clearInterval(iv);
      }, 16);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16,
      padding: 20, position: "relative", overflow: "hidden", cursor: "default", transition: "all 0.3s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}25, transparent 70%)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 500, marginBottom: 8,
            letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-syne, Syne), sans-serif" }}>{label}</p>
          <p style={{ color: "var(--text-primary)", fontSize: 28, fontWeight: 800,
            fontFamily: "var(--font-syne, Syne), sans-serif", lineHeight: 1 }}>
            {n.toLocaleString()}<span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 400 }}>{suffix}</span>
          </p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}20`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
      </div>
    </div>
  );
}

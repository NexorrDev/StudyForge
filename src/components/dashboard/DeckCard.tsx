"use client";
import Link from "next/link";

interface Props { id: string; title: string; subject: string; cards: number; due?: number; progress: number; color?: string; delay?: number; }

export function DeckCard({ id, title, subject, cards, due = 0, progress, color = "var(--primary)", delay = 0 }: Props) {
  return (
    <Link href={`/flashcards/${id}`} style={{ display: "block", padding: 16, borderRadius: 16,
      border: "1px solid var(--border)", background: "var(--bg-card)", cursor: "pointer",
      transition: "all 0.3s", textDecoration: "none", position: "relative", overflow: "hidden",
      animationDelay: `${delay}ms` }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 48px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "16px 16px 0 0",
        background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <span style={{ display: "inline-block", fontSize: 10, fontFamily: "var(--font-syne, Syne), sans-serif",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 8px",
            borderRadius: 20, marginBottom: 6, background: `${color}18`, color, border: `1px solid ${color}30` }}>{subject}</span>
          <h3 style={{ fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{title}</h3>
        </div>
        {due > 0 && <span style={{ background: "rgba(244,63,94,0.2)", border: "1px solid rgba(244,63,94,0.3)",
          borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--rose)", fontWeight: 700,
          fontFamily: "var(--font-syne, Syne), sans-serif", flexShrink: 0 }}>{due} dues</span>}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>{cards} cartes</p>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: color, borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Progression</span>
        <span style={{ fontSize: 10, fontWeight: 700, color }}>{progress}%</span>
      </div>
    </Link>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { DeckCard } from "@/components/dashboard/DeckCard";

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");

  const load = () => fetch("/api/decks").then(r => r.json()).then(d => { setDecks(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const subjects = ["Tous", ...Array.from(new Set(decks.map(d => d.subject).filter(Boolean)))];
  const filtered = filter === "Tous" ? decks : decks.filter(d => d.subject === filter);
  const totalDue = decks.reduce((a, d) => a + (d.due || 0), 0);

  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 32, position: "relative", zIndex: 1 }} className="animate-slide-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: 36, color: "var(--text-primary)" }}>Flashcards</h1>
              <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>{decks.length} decks · {totalDue} cartes a reviser</p>
            </div>
            <Link href="/flashcards/new" style={{ padding: "10px 20px", borderRadius: 12, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 13, color: "white", textDecoration: "none", background: "linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow: "0 4px 20px var(--primary-glow)" }}>
              ✦ Nouveau deck
            </Link>
          </div>

          {totalDue > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20, borderRadius: 16, background: "linear-gradient(135deg, rgba(244,63,94,0.1), rgba(245,158,11,0.08))", border: "1px solid rgba(244,63,94,0.3)" }}>
              <div>
                <p style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>⚡ {totalDue} cartes a reviser maintenant</p>
                <p style={{ fontSize: 13, marginTop: 4, color: "var(--text-secondary)" }}>5 minutes suffisent pour garder ton score SRS optimal</p>
              </div>
              {decks.find(d => d.due > 0) && (
                <Link href={"/flashcards/" + decks.find(d => d.due > 0)?.id + "/study"} style={{ padding: "10px 20px", borderRadius: 12, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 13, color: "white", textDecoration: "none", flexShrink: 0, background: "linear-gradient(135deg, var(--rose), #FF6B8A)" }}>
                  Reviser →
                </Link>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {subjects.map((s) => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 600, cursor: "pointer", background: filter === s ? "var(--primary)" : "var(--bg-card)", color: filter === s ? "white" : "var(--text-secondary)", border: `1px solid ${filter === s ? "var(--primary)" : "var(--border)"}` }}>{s}</button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 40 }}>Chargement...</p>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", borderRadius: 16, border: "1px dashed var(--border)" }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🃏</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Aucun deck pour le moment</p>
              <Link href="/flashcards/new" style={{ padding: "12px 24px", borderRadius: 12, background: "var(--primary)", color: "white", textDecoration: "none", fontWeight: 700 }}>Creer mon premier deck</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {filtered.map((d: any, i: number) => <DeckCard key={d.id} id={d.id} title={d.title} subject={d.subject || ""} cards={d.total} due={d.due} progress={d.progress} color={d.color} delay={i * 60} />)}
            </div>
          )}
        </div>
      </AppShell>
    </>
  );
}

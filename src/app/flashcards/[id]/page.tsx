"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function DeckPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newCard, setNewCard] = useState({ front: "", back: "" });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => fetch(`/api/decks/${params.id}`).then(r => r.json()).then(d => { setDeck(d); setLoading(false); });
  useEffect(() => { load(); }, [params.id]);

  const handleAddCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    setAdding(true);
    await fetch(`/api/decks/${params.id}/flashcards`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard),
    });
    setNewCard({ front: "", back: "" });
    setShowAdd(false);
    setAdding(false);
    load();
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Supprimer cette carte ?")) return;
    await fetch(`/api/decks/${params.id}/flashcards`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    load();
  };

  const handleDeleteDeck = async () => {
    if (!confirm("Supprimer ce deck et toutes ses cartes ?")) return;
    await fetch(`/api/decks/${params.id}`, { method: "DELETE" });
    router.push("/flashcards");
  };

  const iStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-dm-sans, sans-serif)" };

  if (loading) return <><AmbientBackground /><AppShell><p style={{ color: "var(--text-secondary)", padding: 40, textAlign: "center" }}>Chargement...</p></AppShell></>;
  if (!deck || deck.error) return <><AmbientBackground /><AppShell><p style={{ color: "var(--rose)", padding: 40, textAlign: "center" }}>Deck introuvable</p></AppShell></>;

  const now = new Date();
  const dueCount = deck.flashcards?.filter((f: any) => { const rev = f.reviews?.[0]; return !rev || new Date(rev.nextReview) <= now; }).length || 0;
  const total = deck.flashcards?.length || 0;
  const learned = deck.flashcards?.filter((f: any) => f.reviews?.[0]?.lastRating >= 2).length || 0;
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative", zIndex: 1 }} className="animate-slide-up">
          <div>
            <Link href="/flashcards" style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 12, display: "inline-block" }}>← Retour aux decks</Link>
            <div style={{ padding: 28, borderRadius: 16, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,214,232,0.1))", border: "1px solid var(--border-bright)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${deck.color}, transparent)` }} />
              {deck.subject && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, marginBottom: 12, display: "inline-block", background: `${deck.color}20`, color: deck.color, border: `1px solid ${deck.color}30`, fontWeight: 600, fontFamily: "var(--font-syne, sans-serif)" }}>{deck.subject}</span>}
              <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: 28, color: "var(--text-primary)", marginBottom: 6 }}>{deck.title}</h1>
              {deck.description && <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>{deck.description}</p>}
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>{total} cartes · {dueCount} a reviser · {progress}% maitrise</p>
              <div style={{ display: "flex", gap: 10 }}>
                {total > 0 && <Link href={`/flashcards/${params.id}/study`} style={{ padding: "10px 24px", borderRadius: 12, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 14, color: "white", textDecoration: "none", background: "linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow: "0 4px 20px var(--primary-glow)" }}>▶ Reviser</Link>}
                <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "10px 20px", borderRadius: 12, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 600, fontSize: 14, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>+ Ajouter une carte</button>
                <button onClick={handleDeleteDeck} style={{ padding: "10px 20px", borderRadius: 12, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 600, fontSize: 14, cursor: "pointer", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "var(--rose)", marginLeft: "auto" }}>🗑 Supprimer</button>
              </div>
            </div>
          </div>

          {showAdd && (
            <div style={{ padding: 20, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-bright)" }}>
              <h3 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text-primary)" }}>Nouvelle carte</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>RECTO</label>
                  <textarea value={newCard.front} onChange={e => setNewCard(n => ({ ...n, front: e.target.value }))} placeholder="Question..." style={{ ...iStyle, minHeight: 80, resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "var(--primary-light)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>VERSO</label>
                  <textarea value={newCard.back} onChange={e => setNewCard(n => ({ ...n, back: e.target.value }))} placeholder="Reponse..." style={{ ...iStyle, minHeight: 80, resize: "vertical" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleAddCard} disabled={adding} style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", background: "var(--primary)", color: "white", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-syne, sans-serif)" }}>{adding ? "Ajout..." : "Ajouter"}</button>
                <button onClick={() => setShowAdd(false)} style={{ padding: "9px 20px", borderRadius: 10, cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 13, fontFamily: "var(--font-syne, sans-serif)" }}>Annuler</button>
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--text-primary)" }}>Cartes ({total})</h2>
            {total === 0 ? (
              <div style={{ padding: 32, textAlign: "center", borderRadius: 12, border: "1px dashed var(--border)" }}>
                <p style={{ color: "var(--text-secondary)" }}>Aucune carte. Ajoutes-en une !</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {deck.flashcards?.map((card: any, i: number) => {
                  const rev = card.reviews?.[0];
                  const isDue = !rev || new Date(rev.nextReview) <= now;
                  return (
                    <div key={card.id} style={{ display: "flex", gap: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${isDue ? "rgba(244,63,94,0.2)" : "var(--border)"}`, background: "var(--bg-card)" }}>
                      <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", minWidth: 22 }}>{i+1}</span>
                      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>Recto</p>
                          <p style={{ fontSize: 13, color: "var(--text-primary)" }}>{card.front}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--primary-light)", marginBottom: 4 }}>Verso</p>
                          <p style={{ fontSize: 13, color: "var(--cyan)" }}>{card.back}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {isDue && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(244,63,94,0.15)", color: "var(--rose)", border: "1px solid rgba(244,63,94,0.3)", fontWeight: 600 }}>Due</span>}
                        {rev && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>J+{rev.interval || 0}</span>}
                        <button onClick={() => handleDeleteCard(card.id)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)", background: "transparent", color: "var(--rose)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

const COLORS = ["#7C3AED","#06D6E8","#10B981","#F59E0B","#F43F5E","#8B5CF6","#EC4899","#3B82F6"];

export default function NewDeckPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [color, setColor] = useState("#7C3AED");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState([{ front: "", back: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addCard = () => setCards(c => [...c, { front: "", back: "" }]);
  const removeCard = (i: number) => setCards(c => c.filter((_, idx) => idx !== i));
  const updateCard = (i: number, field: "front"|"back", val: string) =>
    setCards(c => c.map((card, idx) => idx === i ? { ...card, [field]: val } : card));

  const handleSave = async () => {
    if (!title.trim()) { setError("Le titre est requis"); return; }
    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    setSaving(true);
    setError("");
    const deckRes = await fetch("/api/decks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subject, color, description }),
    });
    if (!deckRes.ok) { setError("Erreur lors de la creation"); setSaving(false); return; }
    const deck = await deckRes.json();

    if (validCards.length > 0) {
      await fetch(`/api/decks/${deck.id}/flashcards`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validCards),
      });
    }
    router.push(`/flashcards/${deck.id}`);
  };

  const iStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-dm-sans, sans-serif)" };
  const taStyle: React.CSSProperties = { ...iStyle, resize: "vertical", minHeight: 70, lineHeight: 1.6 };

  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative", zIndex: 1 }} className="animate-slide-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Link href="/flashcards" style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>← Retour</Link>
              <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: 28, color: "var(--text-primary)" }}>Nouveau deck</h1>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ padding: "11px 24px", borderRadius: 12, border: "none", cursor: saving ? "not-allowed" : "pointer", background: "linear-gradient(135deg, var(--primary), var(--primary-light))", color: "white", fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Sauvegarde..." : "💾 Creer le deck"}
            </button>
          </div>

          {error && <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "var(--rose)", fontSize: 13 }}>{error}</div>}

          <div style={{ padding: 24, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 15, marginBottom: 20, color: "var(--text-primary)" }}>Informations du deck</h2>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Titre *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Mecanique Quantique" style={iStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Matiere</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="ex: Physique" style={iStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Couleur</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: color === c ? "3px solid white" : "3px solid transparent", cursor: "pointer", outline: color === c ? `3px solid ${c}` : "none", transition: "all 0.15s" }} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description optionnelle..." style={iStyle} />
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Cartes ({cards.length})</h2>
              <button onClick={addCard} style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid var(--border-bright)", background: "transparent", color: "var(--primary-light)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-syne, sans-serif)" }}>+ Ajouter</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cards.map((card, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, padding: 16, borderRadius: 12, background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>RECTO</label>
                    <textarea value={card.front} onChange={e => updateCard(i, "front", e.target.value)} placeholder="Question ou terme..." style={taStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--primary-light)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>VERSO</label>
                    <textarea value={card.back} onChange={e => updateCard(i, "back", e.target.value)} placeholder="Reponse ou definition..." style={taStyle} />
                  </div>
                  <button onClick={() => removeCard(i)} disabled={cards.length === 1} style={{ alignSelf: "center", width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", background: "transparent", color: "var(--rose)", cursor: cards.length === 1 ? "not-allowed" : "pointer", fontSize: 16, opacity: cards.length === 1 ? 0.3 : 1 }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={addCard} style={{ marginTop: 12, width: "100%", padding: 14, borderRadius: 12, border: "2px dashed var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-syne, sans-serif)", fontWeight: 600, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
              + Ajouter une carte
            </button>
          </div>
        </div>
      </AppShell>
    </>
  );
}

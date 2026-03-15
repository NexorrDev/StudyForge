"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function NoteEditorPage({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [deckTitle, setDeckTitle] = useState("");
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [genMsg, setGenMsg] = useState("");

  useEffect(() => {
    if (noteId) {
      fetch(`/api/notes/${noteId}`).then(r => r.json()).then(d => {
        setTitle(d.title || "");
        setSubject(d.subject || "");
        setTags((d.tags || []).join(", "));
        setContent(d.content || "");
      });
    }
  }, [noteId]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const body = { title, content, subject, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean) };
    if (noteId) {
      await fetch(`/api/notes/${noteId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        const note = await res.json();
        router.replace(`/notes/${note.id}`);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGenerate = async () => {
    if (!content.trim() && !title.trim()) { setGenMsg("Ajoute du contenu à ta fiche d'abord !"); return; }
    setGenerating(true);
    setGenMsg("");

    // FIX: call server-side route directly, no client-side API key needed
    const res = await fetch("/api/cards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteTitle: title, noteContent: content, count: genCount }),
    });

    if (!res.ok) {
      const err = await res.json();
      setGenMsg(err.error || "Erreur lors de la génération.");
      setGenerating(false);
      return;
    }

    const data = await res.json();
    if (!data.flashcards?.length) { setGenMsg("Aucune carte générée."); setGenerating(false); return; }

    const deckRes = await fetch("/api/decks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: deckTitle || title, subject }),
    });
    const deck = await deckRes.json();
    await fetch(`/api/decks/${deck.id}/flashcards`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.flashcards),
    });
    setGenerating(false);
    setGenMsg(`✓ ${data.flashcards.length} cartes créées dans le deck "${deck.title}"`);
  };

  const iStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10, background: "var(--bg-card)",
    border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 14,
    outline: "none", fontFamily: "var(--font-dm-sans,sans-serif)", transition: "border-color 0.2s",
  };

  return (
    <><AmbientBackground /><AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, position: "relative", zIndex: 1 }} className="animate-slide-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Link href="/notes" style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", display: "inline-block", marginBottom: 6 }}>← Retour</Link>
            <h1 style={{ fontFamily: "var(--font-syne,sans-serif)", fontWeight: 800, fontSize: 28, color: "var(--text-primary)" }}>{noteId ? "Éditer la fiche" : "Nouvelle fiche"}</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowGenPanel(!showGenPanel)} style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.1)", color: "var(--primary-light)", cursor: "pointer", fontFamily: "var(--font-syne,sans-serif)", fontWeight: 600, fontSize: 13 }}>✦ Générer des flashcards</button>
            <button onClick={handleSave} disabled={saving || !title.trim()} style={{ padding: "10px 22px", borderRadius: 12, border: "none", cursor: saving ? "not-allowed" : "pointer", background: "linear-gradient(135deg,var(--primary),var(--primary-light))", color: "white", fontFamily: "var(--font-syne,sans-serif)", fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Sauvegarde..." : saved ? "✓ Sauvegardé !" : "💾 Sauvegarder"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
          {[
            { label: "Titre *", ph: "ex: Mécanique Quantique", val: title, set: setTitle },
            { label: "Matière", ph: "ex: Physique", val: subject, set: setSubject },
            { label: "Tags (virgules)", ph: "ex: quantique, formules", val: tags, set: setTags },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={iStyle}
                onFocus={e => e.target.style.borderColor = "var(--border-bright)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>
          ))}
        </div>

        {showGenPanel && (
          <div style={{ padding: 20, borderRadius: 16, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <h3 style={{ fontFamily: "var(--font-syne,sans-serif)", fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text-primary)" }}>✦ Générer des flashcards avec l'IA</h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nom du deck</label>
                <input value={deckTitle} onChange={e => setDeckTitle(e.target.value)} placeholder={title || "Nom du deck"} style={iStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nb cartes</label>
                <input type="number" value={genCount} onChange={e => setGenCount(Number(e.target.value))} min={1} max={50} style={{ ...iStyle, textAlign: "center" }} />
              </div>
              <button onClick={handleGenerate} disabled={generating} style={{ padding: "11px 20px", borderRadius: 10, border: "none", cursor: generating ? "not-allowed" : "pointer", background: "var(--primary)", color: "white", fontFamily: "var(--font-syne,sans-serif)", fontWeight: 700, fontSize: 13, opacity: generating ? 0.7 : 1 }}>
                {generating ? "Génération..." : "Générer →"}
              </button>
            </div>
            {genMsg && <p style={{ marginTop: 12, fontSize: 13, color: genMsg.startsWith("✓") ? "var(--emerald)" : "var(--rose)" }}>{genMsg}</p>}
          </div>
        )}

        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            {["H1","H2","B","I","<>","—"].map(lbl => (
              <button key={lbl} style={{ minWidth: 32, height: 30, padding: "0 8px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", background: "transparent", border: "1px solid transparent", fontFamily: "var(--font-syne,sans-serif)", fontWeight: 700, color: "var(--text-secondary)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                {lbl}
              </button>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Rédige ta fiche de cours... Utilise $$E = mc^2$$ pour les formules LaTeX"
            style={{ width: "100%", minHeight: 420, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: 15, lineHeight: 1.7, padding: 20, resize: "vertical" }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>{content.length} caractères · {content.split(/\s+/).filter(Boolean).length} mots</p>
      </div>
    </AppShell></>
  );
}

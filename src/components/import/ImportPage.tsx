"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

type Mode = "flashcards" | "note";

export default function ImportPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("flashcards");
  const [deckName, setDeckName] = useState("");
  const [cardCount, setCardCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const ACCEPTED = ".txt,.html,.htm,.md,.csv";

  const handleFile = (f: File) => {
    setError("");
    if (f.size > 2 * 1024 * 1024) { setError("Fichier trop grand (max 2 Mo)"); return; }
    setFile(f);
    if (!deckName) setDeckName(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);
    fd.append("deckName", deckName);
    fd.append("cardCount", String(cardCount));
    const res = await fetch("/api/import", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erreur"); return; }
    if (data.type === "flashcards") router.push(`/flashcards/${data.deckId}`);
    else router.push(`/notes/${data.noteId}`);
  };

  const iStyle: React.CSSProperties = { width:"100%", padding:"10px 14px", borderRadius:10, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-primary)", fontSize:14, outline:"none", fontFamily:"var(--font-dm-sans,sans-serif)" };

  return (
    <><AmbientBackground /><AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:28, position:"relative", zIndex:1, maxWidth:640, margin:"0 auto" }} className="animate-slide-up">

        <div>
          <Link href="/notes" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", display:"inline-block", marginBottom:8 }}>← Retour</Link>
          <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:28, color:"var(--text-primary)" }}>Importer un fichier</h1>
          <p style={{ marginTop:8, color:"var(--text-secondary)", fontSize:14 }}>Transforme un cours en fiche ou en deck de flashcards avec l'IA</p>
        </div>

        {/* Mode selector */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {([
            { id:"flashcards", icon:"🃏", title:"Générer des flashcards", desc:"L'IA crée un deck de cartes à réviser" },
            { id:"note", icon:"📖", title:"Créer une fiche", desc:"Importe le contenu comme une fiche de révision" },
          ] as { id:Mode; icon:string; title:string; desc:string }[]).map(m => (
            <button key={m.id} onClick={()=>setMode(m.id)} style={{ padding:20, borderRadius:14, cursor:"pointer", textAlign:"left", transition:"all 0.2s",
              background: mode===m.id ? "rgba(124,58,237,0.15)" : "var(--bg-card)",
              border: mode===m.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)" }}>
              <p style={{ fontSize:24, marginBottom:8 }}>{m.icon}</p>
              <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:14, color: mode===m.id ? "var(--primary-light)" : "var(--text-primary)", marginBottom:4 }}>{m.title}</p>
              <p style={{ fontSize:12, color:"var(--text-secondary)" }}>{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onClick={()=>inputRef.current?.click()}
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={handleDrop}
          style={{ padding:"40px 24px", borderRadius:16, textAlign:"center", cursor:"pointer", transition:"all 0.2s",
            border: dragOver ? "2px dashed var(--primary)" : file ? "2px dashed var(--emerald)" : "2px dashed var(--border)",
            background: dragOver ? "rgba(124,58,237,0.06)" : file ? "rgba(16,185,129,0.05)" : "var(--bg-card)" }}>
          <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display:"none" }} onChange={e=>{ if(e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          {file ? (
            <>
              <p style={{ fontSize:36, marginBottom:10 }}>✅</p>
              <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, color:"var(--emerald)", marginBottom:4 }}>{file.name}</p>
              <p style={{ fontSize:13, color:"var(--text-muted)" }}>{(file.size/1024).toFixed(1)} Ko · Clique pour changer</p>
            </>
          ) : (
            <>
              <p style={{ fontSize:40, marginBottom:12 }}>📂</p>
              <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, color:"var(--text-primary)", marginBottom:6 }}>Glisse ton fichier ici</p>
              <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:10 }}>ou clique pour parcourir</p>
              <p style={{ fontSize:11, color:"var(--text-muted)" }}>.txt · .html · .md · .csv — max 2 Mo</p>
            </>
          )}
        </div>

        {/* Options */}
        {file && (
          <div style={{ display:"flex", flexDirection:"column", gap:14, padding:20, borderRadius:14, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {mode==="flashcards" ? "Nom du deck" : "Titre de la fiche"}
              </label>
              <input value={deckName} onChange={e=>setDeckName(e.target.value)} placeholder="Nom..." style={iStyle} />
            </div>
            {mode === "flashcards" && (
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Nombre de flashcards</label>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {[5, 10, 15, 20, 30].map(n => (
                    <button key={n} onClick={()=>setCardCount(n)} style={{ padding:"7px 18px", borderRadius:10, cursor:"pointer", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, transition:"all 0.15s",
                      background: cardCount===n ? "var(--primary)" : "var(--bg-surface)",
                      color: cardCount===n ? "white" : "var(--text-secondary)",
                      border: `1px solid ${cardCount===n ? "var(--primary)" : "var(--border)"}` }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", color:"var(--rose)", fontSize:13 }}>{error}</div>}

        <button onClick={handleSubmit} disabled={!file||loading}
          style={{ padding:"14px 0", borderRadius:14, border:"none", cursor:!file||loading?"not-allowed":"pointer",
            background:"linear-gradient(135deg,var(--primary),var(--primary-light))", color:"white",
            fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:15,
            boxShadow:"0 4px 20px var(--primary-glow)", opacity:!file||loading?0.6:1, transition:"all 0.2s" }}>
          {loading ? (
            <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⚙️</span>
              {mode==="flashcards" ? "L'IA génère tes flashcards..." : "Import en cours..."}
            </span>
          ) : mode==="flashcards" ? "✦ Générer les flashcards" : "📖 Créer la fiche"}
        </button>

        <div style={{ padding:16, borderRadius:12, background:"rgba(6,214,232,0.04)", border:"1px solid rgba(6,214,232,0.12)" }}>
          <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.6 }}>
            <strong style={{ color:"var(--cyan)" }}>Formats supportés :</strong> HTML (cours exportés, pages web), Markdown (.md), texte brut (.txt), CSV<br/>
            <strong style={{ color:"var(--cyan)" }}>Tip :</strong> Copie le HTML d'une page de cours dans un fichier .html pour obtenir les meilleures flashcards.
          </p>
        </div>
      </div>
    </AppShell></>
  );
}

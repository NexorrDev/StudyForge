"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

const SUBJECTS = ["Physique","Chimie","Mathématiques","SVT","Histoire","Géographie","Anglais","Philosophie","Informatique","Économie","Autre"];
type InputMode = "topic" | "content" | "file";

export default function GenerateNotePage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode]         = useState<InputMode>("topic");
  const [topic, setTopic]       = useState("");
  const [content, setContent]   = useState("");
  const [subject, setSubject]   = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState<"idle"|"thinking"|"writing"|"done">("idle");
  const [html, setHtml]         = useState("");
  const [finalTitle, setFinalTitle] = useState("");
  const [noteId, setNoteId]     = useState<string|null>(null);
  const [error, setError]       = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    setError("");
    if (f.size > 10 * 1024 * 1024) { setError("Fichier trop grand (max 10 Mo)"); return; }
    setFile(f);
  };

  const getTitle = () => topic.trim();

  const handleGenerate = async () => {
    const title = getTitle();
    // Validation
    if (mode === "topic" && !title) { setError("Entre un sujet ou un titre."); return; }
    if (mode === "content" && !content.trim()) { setError("Colle le contenu du cours."); return; }
    if (mode === "file" && !file) { setError("Sélectionne un fichier."); return; }
    if (!title && mode === "file") { setError("Entre un titre pour la fiche."); return; }

    setLoading(true); setError(""); setHtml(""); setStep("thinking");
    const timer = setTimeout(() => setStep("writing"), 3000);

    try {
      let res: Response;

      if (mode === "file" && file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("topic", title); // titre toujours envoyé
        fd.append("subject", subject);
        res = await fetch("/api/notes/generate", { method:"POST", body: fd });
      } else {
        res = await fetch("/api/notes/generate", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ topic: title, content, subject }),
        });
      }

      clearTimeout(timer);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la génération.");
        setStep("idle");
        setLoading(false);
        return;
      }

      setHtml(data.html || "");
      setFinalTitle(data.title || title);
      setNoteId(data.noteId || null);
      setStep("done");
    } catch (e: any) {
      clearTimeout(timer);
      setError(e.message || "Erreur réseau.");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const iStyle: React.CSSProperties = {
    width:"100%", padding:"11px 14px", borderRadius:10,
    background:"var(--bg-card)", border:"1px solid var(--border)",
    color:"var(--text-primary)", fontSize:14, outline:"none",
    fontFamily:"var(--font-dm-sans,sans-serif)", transition:"border-color 0.2s",
  };

  const MODES = [
    { id:"topic",   icon:"💡", title:"Sujet libre",        desc:"Décris le sujet à réviser" },
    { id:"content", icon:"📋", title:"Coller un cours",    desc:"Colle le texte de tes notes" },
    { id:"file",    icon:"📎", title:"Envoyer un fichier", desc:"PDF, HTML, TXT, MD…" },
  ] as { id:InputMode; icon:string; title:string; desc:string }[];

  if (step === "done") {
    return (
      <><AmbientBackground /><AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:20, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div>
            <Link href="/notes" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", display:"inline-block", marginBottom:8 }}>← Fiches</Link>
            <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:24, color:"var(--text-primary)" }}>Fiche générée !</h1>
          </div>

          <div style={{ padding:"16px 20px", borderRadius:14, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, color:"var(--emerald)", fontSize:15 }}>✅ Sauvegardée avec succès</p>
              <p style={{ fontSize:13, color:"var(--text-secondary)", marginTop:3 }}>{finalTitle}</p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button onClick={() => { setStep("idle"); setHtml(""); setTopic(""); setContent(""); setFile(null); setNoteId(null); }}
                style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>
                Nouvelle fiche
              </button>
              {noteId && (
                <Link href={`/notes/${noteId}`} style={{ padding:"8px 16px", borderRadius:10, background:"var(--primary)", color:"white", textDecoration:"none", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13 }}>
                  Ouvrir la fiche →
                </Link>
              )}
            </div>
          </div>

          {html && (
            <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid var(--border)" }}>
              <div style={{ padding:"10px 16px", background:"rgba(0,0,0,0.3)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--rose)", flexShrink:0 }} />
                <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--amber)", flexShrink:0 }} />
                <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--emerald)", flexShrink:0 }} />
                <span style={{ marginLeft:8, fontSize:11, color:"var(--text-muted)", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Aperçu — {finalTitle}</span>
              </div>
              <iframe srcDoc={html} style={{ width:"100%", height:600, border:"none", display:"block" }} title="Fiche" sandbox="allow-scripts" />
            </div>
          )}
        </div>
      </AppShell></>
    );
  }

  return (
    <><AmbientBackground /><AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:24, position:"relative", zIndex:1, maxWidth:680, margin:"0 auto" }} className="animate-slide-up">

        <div>
          <Link href="/notes" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", display:"inline-block", marginBottom:8 }}>← Fiches</Link>
          <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:26, color:"var(--text-primary)" }}>Générer une fiche avec l'IA</h1>
          <p style={{ marginTop:6, color:"var(--text-secondary)", fontSize:14 }}>Hunter Alpha crée une fiche visuelle complète à partir de ton cours</p>
        </div>

        {/* Mode */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              padding:"14px 12px", borderRadius:12, cursor:"pointer", textAlign:"left", transition:"all 0.2s",
              background: mode===m.id ? "rgba(124,58,237,0.15)" : "var(--bg-card)",
              border: mode===m.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
            }}>
              <p style={{ fontSize:20, marginBottom:5 }}>{m.icon}</p>
              <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:12, color:mode===m.id?"var(--primary-light)":"var(--text-primary)", marginBottom:2 }}>{m.title}</p>
              <p style={{ fontSize:11, color:"var(--text-secondary)", lineHeight:1.3 }}>{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Titre — toujours visible */}
        <div>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {mode === "topic" ? "Sujet / Titre *" : "Titre de la fiche *"}
          </label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder={mode === "topic" ? "ex: Loi de Newton — Première Spécialité Physique" : "ex: Chapitre 12 — Mouvement d'un système"}
            style={iStyle}
            onFocus={e => e.target.style.borderColor="var(--border-bright)"}
            onBlur={e => e.target.style.borderColor="var(--border)"}
            onKeyDown={e => { if(e.key==="Enter" && mode==="topic") handleGenerate(); }} />
        </div>

        {/* Matière */}
        <div>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Matière (optionnel)</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(subject===s?"":s)} style={{
                padding:"5px 12px", borderRadius:20, cursor:"pointer", fontSize:12, transition:"all 0.15s",
                fontFamily:"var(--font-syne,sans-serif)", fontWeight:600,
                background: subject===s ? "var(--primary)" : "var(--bg-card)",
                color: subject===s ? "white" : "var(--text-secondary)",
                border: `1px solid ${subject===s ? "var(--primary)" : "var(--border)"}`,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Content input */}
        {mode === "content" && (
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Texte du cours *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Colle ici le texte extrait de ton PDF, tes notes..."
              style={{ ...iStyle, minHeight:180, resize:"vertical", lineHeight:1.6 }} />
            <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>{content.length} caractères</p>
          </div>
        )}

        {mode === "file" && (
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Fichier du cours *</label>
            <input ref={fileRef} type="file" accept=".txt,.html,.htm,.md,.pdf" style={{ display:"none" }} onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              style={{ padding:"28px 20px", borderRadius:12, textAlign:"center", cursor:"pointer", transition:"all 0.2s",
                border: dragOver ? "2px dashed var(--primary)" : file ? "2px dashed var(--emerald)" : "2px dashed var(--border)",
                background: dragOver ? "rgba(124,58,237,0.06)" : file ? "rgba(16,185,129,0.05)" : "var(--bg-card)" }}>
              {file ? (
                <>
                  <p style={{ fontSize:28, marginBottom:6 }}>✅</p>
                  <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, color:"var(--emerald)", marginBottom:2, fontSize:13 }}>{file.name}</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)" }}>{(file.size/1024).toFixed(1)} Ko · Clique pour changer</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize:32, marginBottom:8 }}>📎</p>
                  <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, color:"var(--text-primary)", marginBottom:4, fontSize:14 }}>Glisse ou clique</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)" }}>PDF · TXT · HTML · MD — max 10 Mo</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", color:"var(--rose)", fontSize:13 }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ padding:20, borderRadius:14, background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", textAlign:"center" }}>
            <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:14, color:"var(--primary-light)", marginBottom:10 }}>
              {step === "thinking" ? "🧠 Analyse du contenu..." : "✍️ Rédaction de la fiche..."}
            </p>
            <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:2, background:"linear-gradient(90deg,var(--primary),var(--cyan))", boxShadow:"0 0 8px var(--primary-glow)",
                width: step==="thinking" ? "35%" : "85%", transition:"width 3s ease" }} />
            </div>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:8 }}>20–40 secondes selon la complexité</p>
          </div>
        )}

        {/* Submit */}
        {!loading && (
          <button onClick={handleGenerate} style={{
            padding:"14px 0", borderRadius:14, border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,var(--primary),var(--primary-light))",
            color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:15,
            boxShadow:"0 4px 20px var(--primary-glow)",
          }}>
            ✦ Générer la fiche
          </button>
        )}
      </div>
    </AppShell></>
  );
}

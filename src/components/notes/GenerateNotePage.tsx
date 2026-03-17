"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

const SUBJECTS = ["Physique","Chimie","Mathématiques","SVT","Histoire","Géographie","Anglais","Philosophie","Informatique","Économie","Autre"];

export default function GenerateNotePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"topic"|"content">("topic");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle"|"thinking"|"writing"|"done">("idle");
  const [html, setHtml] = useState("");
  const [title, setTitle] = useState("");
  const [noteId, setNoteId] = useState<string|null>(null);
  const [error, setError] = useState("");

  const STEPS = ["idle","thinking","writing","done"];
  const STEP_LABELS: Record<string, string> = {
    idle: "",
    thinking: "🧠 Hunter Alpha analyse le sujet...",
    writing: "✍️ Génération de la fiche en cours...",
    done: "✅ Fiche générée !",
  };

  const handleGenerate = async () => {
    if (mode === "topic" && !topic.trim()) return;
    if (mode === "content" && !content.trim()) return;
    setLoading(true); setError(""); setHtml(""); setStep("thinking");

    // Simulate step transition
    setTimeout(() => setStep("writing"), 2000);

    const res = await fetch("/api/notes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: mode === "topic" ? topic : "",
        content: mode === "content" ? content : "",
        subject,
        save: true,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Erreur"); setStep("idle"); return; }
    setHtml(data.html);
    setTitle(data.title);
    setNoteId(data.noteId);
    setStep("done");
  };

  const iStyle: React.CSSProperties = {
    width:"100%", padding:"11px 14px", borderRadius:10,
    background:"var(--bg-card)", border:"1px solid var(--border)",
    color:"var(--text-primary)", fontSize:14, outline:"none",
    fontFamily:"var(--font-dm-sans,sans-serif)", transition:"border-color 0.2s",
  };

  return (
    <><AmbientBackground /><AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:28, position:"relative", zIndex:1 }} className="animate-slide-up">

        <div>
          <Link href="/notes" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", display:"inline-block", marginBottom:8 }}>← Retour aux fiches</Link>
          <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:28, color:"var(--text-primary)" }}>
            Générer une fiche avec l'IA
          </h1>
          <p style={{ marginTop:8, color:"var(--text-secondary)", fontSize:14 }}>
            Hunter Alpha crée une fiche de révision complète et visuelle, avec formules LaTeX, tableaux et exemples
          </p>
        </div>

        {step === "idle" || step === "thinking" || step === "writing" ? (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Mode selector */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { id:"topic", icon:"💡", title:"À partir d'un sujet", desc:"Dis à l'IA ce que tu veux réviser" },
                { id:"content", icon:"📋", title:"À partir d'un cours", desc:"Colle le texte de ton cours" },
              ].map(m => (
                <button key={m.id} onClick={()=>setMode(m.id as "topic"|"content")} style={{
                  padding:18, borderRadius:14, cursor:"pointer", textAlign:"left", transition:"all 0.2s",
                  background: mode===m.id ? "rgba(124,58,237,0.15)" : "var(--bg-card)",
                  border: mode===m.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
                }}>
                  <p style={{ fontSize:22, marginBottom:6 }}>{m.icon}</p>
                  <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, color:mode===m.id?"var(--primary-light)":"var(--text-primary)", marginBottom:3 }}>{m.title}</p>
                  <p style={{ fontSize:12, color:"var(--text-secondary)" }}>{m.desc}</p>
                </button>
              ))}
            </div>

            {/* Matière */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Matière</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {SUBJECTS.map(s => (
                  <button key={s} onClick={()=>setSubject(subject===s?"":s)} style={{
                    padding:"6px 14px", borderRadius:20, cursor:"pointer", fontSize:12, transition:"all 0.15s",
                    fontFamily:"var(--font-syne,sans-serif)", fontWeight:600,
                    background: subject===s ? "var(--primary)" : "var(--bg-card)",
                    color: subject===s ? "white" : "var(--text-secondary)",
                    border: `1px solid ${subject===s ? "var(--primary)" : "var(--border)"}`,
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Input */}
            {mode === "topic" ? (
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Sujet à réviser *</label>
                <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="ex: Mouvement d'un système — Loi de Newton, vecteur vitesse, inertie" style={iStyle}
                  onFocus={e=>e.target.style.borderColor="var(--border-bright)"}
                  onBlur={e=>e.target.style.borderColor="var(--border)"}
                  onKeyDown={e=>{ if(e.key==="Enter") handleGenerate(); }} />
                <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>Sois précis : chapitre, concepts clés, niveau (Première, Terminale…)</p>
              </div>
            ) : (
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Contenu du cours *</label>
                <textarea value={content} onChange={e=>setContent(e.target.value)}
                  placeholder="Colle ici le texte de ton cours, tes notes, ou le contenu extrait de ton PDF..."
                  style={{ ...iStyle, minHeight:200, resize:"vertical", lineHeight:1.6 }} />
                <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>{content.length} caractères · {Math.round(content.length/4)} tokens environ</p>
              </div>
            )}

            {error && <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", color:"var(--rose)", fontSize:13 }}>{error}</div>}

            {/* Loading state */}
            {loading && (
              <div style={{ padding:20, borderRadius:14, background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", textAlign:"center" }}>
                <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:14, color:"var(--primary-light)", marginBottom:8 }}>{STEP_LABELS[step]}</p>
                <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:2, background:"linear-gradient(90deg,var(--primary),var(--cyan))",
                    width: step==="thinking"?"40%":"80%", transition:"width 2s ease", boxShadow:"0 0 8px var(--primary-glow)" }} />
                </div>
                <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:8 }}>Peut prendre 20-40 secondes selon la complexité</p>
              </div>
            )}

            <button onClick={handleGenerate} disabled={loading||(mode==="topic"?!topic.trim():!content.trim())}
              style={{ padding:"14px 0", borderRadius:14, border:"none",
                cursor:loading||(mode==="topic"?!topic.trim():!content.trim())?"not-allowed":"pointer",
                background:"linear-gradient(135deg,var(--primary),var(--primary-light))", color:"white",
                fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:15,
                boxShadow:"0 4px 20px var(--primary-glow)",
                opacity:loading||(mode==="topic"?!topic.trim():!content.trim())?0.6:1 }}>
              {loading ? "Génération en cours..." : "✦ Générer la fiche"}
            </button>
          </div>
        ) : null}

        {/* Result */}
        {step === "done" && html && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }} className="animate-slide-up">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderRadius:14,
              background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)" }}>
              <div>
                <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, color:"var(--emerald)", fontSize:15 }}>✅ Fiche générée et sauvegardée !</p>
                <p style={{ fontSize:13, color:"var(--text-secondary)", marginTop:3 }}>{title}</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{ setStep("idle"); setHtml(""); setTopic(""); setContent(""); }}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>
                  Nouvelle fiche
                </button>
                {noteId && (
                  <Link href={`/notes/${noteId}`} style={{ padding:"8px 16px", borderRadius:10, background:"var(--primary)", color:"white", textDecoration:"none", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13 }}>
                    Voir la fiche →
                  </Link>
                )}
              </div>
            </div>

            {/* Preview in iframe */}
            <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid var(--border)", background:"#0a0a0f" }}>
              <div style={{ padding:"10px 16px", background:"rgba(0,0,0,0.3)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--rose)" }} />
                <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--amber)" }} />
                <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--emerald)" }} />
                <span style={{ marginLeft:8, fontSize:11, color:"var(--text-muted)", fontFamily:"monospace" }}>Aperçu de la fiche générée</span>
              </div>
              <iframe
                srcDoc={html}
                style={{ width:"100%", height:600, border:"none", display:"block" }}
                title="Aperçu de la fiche"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </AppShell></>
  );
}

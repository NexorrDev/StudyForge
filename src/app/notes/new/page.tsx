"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function NewNotePage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const inputStyle: React.CSSProperties = {
    width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12,
    color:"var(--text-primary)", fontFamily:"var(--font-dm-sans, DM Sans), sans-serif", fontSize:14,
    outline:"none", padding:"12px 16px", transition:"border-color 0.2s",
  };

  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:24, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h1 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:30, color:"var(--text-primary)" }}>Nouvelle fiche</h1>
              <p style={{ fontSize:13, marginTop:6, color:"var(--text-secondary)" }}>Supporte Markdown, LaTeX, images et tableaux</p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button style={{ ...inputStyle, width:"auto", padding:"10px 20px", cursor:"pointer",
                fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:600 }}>Apercu</button>
              <button onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2000); }}
                style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
                  fontWeight:700, fontSize:14, color:"white", cursor:"pointer", border:"none",
                  background: saved ? "linear-gradient(135deg,var(--emerald),#34D399)" : "linear-gradient(135deg,var(--primary),var(--primary-light))" }}>
                {saved ? "✓ Sauvegarde !" : "💾 Sauvegarder"}
              </button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:16 }}>
            {[
              { label:"Titre", placeholder:"ex: Mecanique Quantique - Bases", val:title, set:setTitle },
              { label:"Matiere", placeholder:"ex: Physique", val:subject, set:setSubject },
              { label:"Tags (virgules)", placeholder:"ex: quantique, formules", val:tags, set:setTags },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display:"block", fontSize:11, fontFamily:"var(--font-syne, Syne), sans-serif",
                  fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em",
                  color:"var(--text-secondary)", marginBottom:6 }}>{f.label}</label>
                <input value={f.val} onChange={e=>f.set(e.target.value)}
                  placeholder={f.placeholder} style={inputStyle}
                  onFocus={e=>{e.target.style.borderColor="var(--border-bright)";}}
                  onBlur={e=>{e.target.style.borderColor="var(--border)";}} />
              </div>
            ))}
          </div>
          <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid var(--border)", background:"var(--bg-card)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, padding:"10px 12px", flexWrap:"wrap",
              background:"rgba(0,0,0,0.2)", borderBottom:"1px solid var(--border)" }}>
              {["H1","H2","H3","|","B","I","U","<>","|","•—","1.",'"',"|","🖼️","⊞","∑"].map((btn,i) => (
                btn === "|"
                  ? <div key={i} style={{ width:1, height:20, background:"var(--border)", margin:"0 4px" }} />
                  : <button key={i} style={{ width:32, height:32, borderRadius:8, display:"flex",
                      alignItems:"center", justifyContent:"center", fontSize:12, cursor:"pointer",
                      background:"transparent", border:"1px solid transparent",
                      fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700,
                      color:"var(--text-secondary)", transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="var(--text-primary)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text-secondary)";}}>
                      {btn}
                    </button>
              ))}
            </div>
            <textarea value={content} onChange={e=>setContent(e.target.value)}
              placeholder="Commence a rediger ta fiche de cours... Utilise $$E = mc^2$$ pour les formules LaTeX"
              style={{ width:"100%", minHeight:400, background:"transparent", border:"none", outline:"none",
                color:"var(--text-primary)", fontFamily:"var(--font-dm-sans, DM Sans), sans-serif",
                fontSize:15, lineHeight:1.7, padding:20, resize:"vertical" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:16, borderRadius:12,
            background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)" }}>
            <p style={{ fontSize:12, color:"var(--text-secondary)" }}>
              Astuce : Utilise $$formule$$ pour inserer des equations LaTeX en ligne.
            </p>
            <button style={{ padding:"8px 16px", borderRadius:10, fontSize:12, cursor:"pointer",
              fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:600,
              background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)" }}>
              ✦ Generer des flashcards depuis cette fiche
            </button>
          </div>
        </div>
      </AppShell>
    </>
  );
}

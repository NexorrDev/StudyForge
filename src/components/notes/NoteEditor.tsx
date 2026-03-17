"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

function ToolBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onClick={onClick} style={{
      minWidth: 32, height: 30, padding: "0 8px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-syne,sans-serif)", fontWeight: 700,
      background: active ? "rgba(124,58,237,0.3)" : "transparent", color: active ? "var(--primary-light)" : "var(--text-secondary)",
      border: active ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="var(--text-primary)"; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-secondary)"; }}}>
      {children}
    </button>
  );
}
function Divider() { return <div style={{ width:1, height:20, background:"var(--border)", margin:"0 4px" }} />; }

function renderLatexInHtml(html: string): string {
  if (typeof window === "undefined") return html;
  const w = window as any;
  if (!w.katex) return html;
  return html
    .replace(/\$\$([^$]+)\$\$/g, (_, expr) => {
      try { return `<div class="katex-block-rendered">${w.katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`; }
      catch { return expr; }
    })
    .replace(/\$([^$\n<>]+)\$/g, (_, expr) => {
      try { return `<span class="katex-inline-rendered">${w.katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })}</span>`; }
      catch { return expr; }
    });
}

// Detect if content is a full HTML document (AI-generated)
function isFullHtml(content: string): boolean {
  return content.trim().startsWith("<!DOCTYPE") || content.trim().startsWith("<html");
}

function NoteViewer({ html }: { html: string }) {
  const [rendered, setRendered] = useState(html);

  useEffect(() => {
    // Full HTML — show in iframe
    if (isFullHtml(html)) { setRendered(html); return; }

    const w = window as any;
    const doRender = () => setRendered(renderLatexInHtml(html));

    if (w.katex) { doRender(); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = doRender;
    document.head.appendChild(script);
  }, [html]);

  if (isFullHtml(html)) {
    return (
      <iframe srcDoc={html} style={{ width:"100%", height:700, border:"none", display:"block" }}
        title="Fiche de révision" sandbox="allow-scripts" />
    );
  }

  return (
    <div className="note-viewer" dangerouslySetInnerHTML={{ __html: rendered }}
      style={{ padding:28, minHeight:300, lineHeight:1.8, fontSize:15, color:"var(--text-primary)", fontFamily:"var(--font-dm-sans,sans-serif)" }} />
  );
}

export default function NoteEditorPage({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"view"|"edit">(noteId ? "view" : "edit");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(15);
  const [deckTitle, setDeckTitle] = useState("");
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [genMsg, setGenMsg] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showLatexHelper, setShowLatexHelper] = useState(false);
  const [latexInput, setLatexInput] = useState("");
  const [latexPreview, setLatexPreview] = useState("");
  const [katexLoaded, setKatexLoaded] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  useEffect(() => {
    const w = window as any;
    if (w.katex) { setKatexLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => setKatexLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!katexLoaded || !latexInput) { setLatexPreview(""); return; }
    try {
      setLatexPreview((window as any).katex.renderToString(latexInput, { displayMode: true, throwOnError: false }));
    } catch { setLatexPreview('<span style="color:var(--rose)">Erreur</span>'); }
  }, [latexInput, katexLoaded]);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1,2,3] } }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-editor-inner",
        style: "outline:none; min-height:400px; padding:24px; font-size:15px; line-height:1.8; color:var(--text-primary); font-family:var(--font-dm-sans,sans-serif);",
      },
    },
    onUpdate: ({ editor }) => {
      setWordCount(editor.getText().split(/\s+/).filter(Boolean).length);
      setHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (noteId && editor) {
      fetch(`/api/notes/${noteId}`).then(r => r.json()).then(d => {
        setTitle(d.title || "");
        setSubject(d.subject || "");
        setTags((d.tags || []).join(", "));
        if (d.content) {
          const fullHtml = isFullHtml(d.content);
          setIsAiGenerated(fullHtml);
          setHtmlContent(d.content);
          if (!fullHtml) {
            editor.commands.setContent(d.content);
          }
          setWordCount(d.content.replace(/<[^>]+>/g,"").split(/\s+/).filter(Boolean).length);
        }
      });
    }
  }, [noteId, editor]);

  const handleSave = async () => {
    if (!title.trim() || !editor) return;
    setSaving(true);
    const content = isAiGenerated ? htmlContent : editor.getHTML();
    setHtmlContent(content);
    const body = { title, content, subject, tags: tags.split(",").map((t:string)=>t.trim()).filter(Boolean) };
    if (noteId) {
      await fetch(`/api/notes/${noteId}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      setSaving(false); setSaved(true);
      setTimeout(() => { setSaved(false); setMode("view"); }, 1200);
    } else {
      const res = await fetch("/api/notes", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (res.ok) { const note = await res.json(); router.replace(`/notes/${note.id}`); }
      setSaving(false);
    }
  };

  const insertLatex = (display: boolean) => {
    if (!editor || !latexInput.trim()) return;
    editor.chain().focus().insertContent((display ? `$$${latexInput}$$` : `$${latexInput}$`) + " ").run();
    setLatexInput(""); setShowLatexHelper(false);
  };

  const handleGenerate = async () => {
    if (!editor) return;
    const content = isAiGenerated ? "" : editor.getText();
    if (!content.trim() && !title.trim()) { setGenMsg("Ajoute du contenu d'abord !"); return; }
    setGenerating(true); setGenMsg("");
    const res = await fetch("/api/cards/generate", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ noteTitle:title, noteContent: isAiGenerated ? title : content, count:genCount }),
    });
    if (!res.ok) { const err = await res.json(); setGenMsg(err.error||"Erreur."); setGenerating(false); return; }
    const data = await res.json();
    if (!data.flashcards?.length) { setGenMsg("Aucune carte générée."); setGenerating(false); return; }
    const deckRes = await fetch("/api/decks", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ title:deckTitle||title, subject }) });
    const deck = await deckRes.json();
    await fetch(`/api/decks/${deck.id}/flashcards`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data.flashcards) });
    setGenerating(false);
    setGenMsg(`✓ ${data.flashcards.length} cartes créées dans "${deck.title}"`);
  };

  const iStyle: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-primary)", fontSize:14, outline:"none", fontFamily:"var(--font-dm-sans,sans-serif)", transition:"border-color 0.2s" };
  const LATEX_EX = [
    { label:"Fraction", code:"\\frac{a}{b}" }, { label:"Puissance", code:"x^{n}" },
    { label:"Intégrale", code:"\\int_0^\\infty f(x)dx" }, { label:"Somme", code:"\\sum_{i=1}^{n}x_i" },
    { label:"Racine", code:"\\sqrt{x^2+y^2}" }, { label:"Vecteur", code:"\\vec{F}=m\\vec{a}" },
    { label:"Grec", code:"\\alpha,\\beta,\\gamma" }, { label:"E=mc²", code:"E=mc^2" },
  ];

  return (
    <>
      <style>{`
        .tiptap-editor-inner h1,.note-viewer h1{font-size:26px;font-weight:800;margin:20px 0 12px;font-family:var(--font-syne,sans-serif);color:var(--text-primary);}
        .tiptap-editor-inner h2,.note-viewer h2{font-size:20px;font-weight:700;margin:16px 0 10px;font-family:var(--font-syne,sans-serif);color:var(--text-primary);}
        .tiptap-editor-inner h3,.note-viewer h3{font-size:16px;font-weight:600;margin:14px 0 8px;font-family:var(--font-syne,sans-serif);color:var(--primary-light);}
        .tiptap-editor-inner p,.note-viewer p{margin-bottom:10px;}
        .tiptap-editor-inner strong,.note-viewer strong{color:var(--primary-light);font-weight:700;}
        .tiptap-editor-inner em,.note-viewer em{color:var(--cyan);font-style:italic;}
        .tiptap-editor-inner code,.note-viewer code{background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.25);border-radius:6px;padding:2px 8px;font-size:13px;color:var(--primary-light);font-family:monospace;}
        .tiptap-editor-inner pre,.note-viewer pre{background:rgba(0,0,0,0.5);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin:14px 0;overflow-x:auto;}
        .tiptap-editor-inner blockquote,.note-viewer blockquote{border-left:3px solid var(--primary);padding-left:16px;margin:14px 0;color:var(--text-secondary);font-style:italic;}
        .tiptap-editor-inner ul,.note-viewer ul{padding-left:22px;margin-bottom:12px;list-style:disc;}
        .tiptap-editor-inner ol,.note-viewer ol{padding-left:22px;margin-bottom:12px;list-style:decimal;}
        .tiptap-editor-inner li,.note-viewer li{margin-bottom:4px;}
        .tiptap-editor-inner hr,.note-viewer hr{border:none;border-top:1px solid var(--border);margin:20px 0;}
        .katex-block-rendered{display:block;text-align:center;margin:14px 0;padding:14px;background:rgba(6,214,232,0.04);border-radius:10px;border:1px solid rgba(6,214,232,0.15);overflow-x:auto;}
        .katex-inline-rendered{display:inline;padding:0 2px;}
      `}</style>

      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:20, position:"relative", zIndex:1 }} className="animate-slide-up">

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <Link href="/notes" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", display:"inline-block", marginBottom:6 }}>← Retour aux fiches</Link>
              <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:26, color:"var(--text-primary)" }}>
                {title || (noteId ? "Fiche" : "Nouvelle fiche")}
              </h1>
              {isAiGenerated && <span style={{ fontSize:11, padding:"2px 10px", borderRadius:20, marginTop:6, display:"inline-block", background:"rgba(245,158,11,0.12)", color:"var(--amber)", fontWeight:600, border:"1px solid rgba(245,158,11,0.25)" }}>✦ Générée par l'IA</span>}
              {subject && !isAiGenerated && <span style={{ fontSize:11, padding:"2px 10px", borderRadius:20, marginTop:6, display:"inline-block", background:"rgba(124,58,237,0.15)", color:"var(--primary-light)", fontWeight:600 }}>{subject}</span>}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              {mode === "view" ? (
                <>
                  <button onClick={()=>setShowGenPanel(!showGenPanel)} style={{ padding:"9px 16px", borderRadius:12, border:"1px solid rgba(124,58,237,0.3)", background:"rgba(124,58,237,0.1)", color:"var(--primary-light)", cursor:"pointer", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>✦ Générer flashcards</button>
                  {!isAiGenerated && <button onClick={()=>setMode("edit")} style={{ padding:"9px 20px", borderRadius:12, border:"none", cursor:"pointer", background:"linear-gradient(135deg,var(--primary),var(--primary-light))", color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, boxShadow:"0 4px 16px var(--primary-glow)" }}>✏️ Modifier</button>}
                </>
              ) : (
                <>
                  {noteId && <button onClick={()=>setMode("view")} style={{ padding:"9px 16px", borderRadius:12, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>👁 Aperçu</button>}
                  <button onClick={()=>setShowGenPanel(!showGenPanel)} style={{ padding:"9px 14px", borderRadius:12, border:"1px solid rgba(124,58,237,0.3)", background:"rgba(124,58,237,0.1)", color:"var(--primary-light)", cursor:"pointer", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>✦ Flashcards</button>
                  <button onClick={handleSave} disabled={saving||!title.trim()} style={{ padding:"9px 20px", borderRadius:12, border:"none", cursor:saving?"not-allowed":"pointer", background:"linear-gradient(135deg,var(--primary),var(--primary-light))", color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:saving||!title.trim()?0.6:1 }}>
                    {saving?"Sauvegarde...":saved?"✓ Sauvegardé !":"💾 Sauvegarder"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* AI flashcard panel */}
          {showGenPanel && (
            <div style={{ padding:18, borderRadius:14, background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.2)" }}>
              <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, marginBottom:12, color:"var(--text-primary)" }}>✦ Générer des flashcards avec Hunter Alpha</h3>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr auto", gap:12, alignItems:"flex-end" }}>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Nom du deck</label>
                  <input value={deckTitle} onChange={e=>setDeckTitle(e.target.value)} placeholder={title||"Nom du deck"} style={iStyle} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Nb cartes</label>
                  <input type="number" value={genCount} onChange={e=>setGenCount(Number(e.target.value))} min={1} max={50} style={{...iStyle,textAlign:"center"}} />
                </div>
                <button onClick={handleGenerate} disabled={generating} style={{ padding:"11px 20px", borderRadius:10, border:"none", cursor:generating?"not-allowed":"pointer", background:"var(--primary)", color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:generating?0.7:1 }}>
                  {generating?"...":"Générer →"}
                </button>
              </div>
              {genMsg&&<p style={{ marginTop:10, fontSize:13, color:genMsg.startsWith("✓")?"var(--emerald)":"var(--rose)" }}>{genMsg}</p>}
            </div>
          )}

          {/* VIEW MODE */}
          {mode === "view" && (
            <div style={{ borderRadius:16, border:"1px solid var(--border)", background:isAiGenerated?"#0a0a0f":"var(--bg-card)", overflow:"hidden" }}>
              {!isAiGenerated && (
                <div style={{ padding:"10px 20px", background:"rgba(0,0,0,0.2)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:12, color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600 }}>Mode lecture</span>
                  {tags && tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=>(
                    <span key={t} style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(6,214,232,0.08)", color:"var(--cyan)", border:"1px solid rgba(6,214,232,0.15)" }}>#{t}</span>
                  ))}
                  <span style={{ marginLeft:"auto", fontSize:11, color:"var(--text-muted)" }}>{wordCount} mots</span>
                </div>
              )}
              {htmlContent
                ? <NoteViewer html={htmlContent} />
                : <div style={{ padding:40, textAlign:"center", color:"var(--text-muted)", fontStyle:"italic" }}>Fiche vide — clique Modifier pour commencer</div>
              }
            </div>
          )}

          {/* EDIT MODE */}
          {mode === "edit" && !isAiGenerated && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:14 }}>
                {[{label:"Titre *",ph:"ex: Mécanique Quantique",val:title,set:setTitle},{label:"Matière",ph:"ex: Physique",val:subject,set:setSubject},{label:"Tags",ph:"ex: quantique, ondes",val:tags,set:setTags}].map(f=>(
                  <div key={f.label}>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{f.label}</label>
                    <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={iStyle}
                      onFocus={e=>e.target.style.borderColor="var(--border-bright)"}
                      onBlur={e=>e.target.style.borderColor="var(--border)"} />
                  </div>
                ))}
              </div>

              {showLatexHelper && (
                <div style={{ padding:18, borderRadius:14, background:"rgba(6,214,232,0.04)", border:"1px solid rgba(6,214,232,0.2)" }}>
                  <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, marginBottom:12, color:"var(--text-primary)" }}>∑ Insérer une équation LaTeX</h3>
                  <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                    {LATEX_EX.map(ex=><button key={ex.label} onClick={()=>setLatexInput(ex.code)} style={{ padding:"4px 12px", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, background:"rgba(6,214,232,0.1)", color:"var(--cyan)", border:"1px solid rgba(6,214,232,0.2)" }}>{ex.label}</button>)}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:12 }}>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase" }}>Code LaTeX</label>
                      <input value={latexInput} onChange={e=>setLatexInput(e.target.value)} placeholder="ex: \frac{1}{2}mv^2" style={{...iStyle,fontFamily:"monospace"}}
                        onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();insertLatex(true);}}} />
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase" }}>Aperçu</label>
                      <div style={{ minHeight:44, padding:"10px 14px", borderRadius:10, background:"rgba(0,0,0,0.3)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}
                        dangerouslySetInnerHTML={{ __html:latexPreview||'<span style="color:var(--text-muted);font-style:italic;font-size:13px">Tapez une formule...</span>' }} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={()=>insertLatex(false)} disabled={!latexInput.trim()} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:!latexInput.trim()?"not-allowed":"pointer", background:"rgba(6,214,232,0.15)", color:"var(--cyan)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:!latexInput.trim()?0.5:1 }}>En ligne</button>
                    <button onClick={()=>insertLatex(true)} disabled={!latexInput.trim()} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:!latexInput.trim()?"not-allowed":"pointer", background:"rgba(124,58,237,0.2)", color:"var(--primary-light)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:!latexInput.trim()?0.5:1 }}>En bloc</button>
                    <button onClick={()=>setShowLatexHelper(false)} style={{ padding:"8px 18px", borderRadius:10, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>Fermer</button>
                  </div>
                </div>
              )}

              <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid var(--border-bright)", background:"var(--bg-card)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:2, padding:"8px 12px", background:"rgba(0,0,0,0.25)", borderBottom:"1px solid var(--border)", flexWrap:"wrap" }}>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Gras"><strong>B</strong></ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italique"><em>I</em></ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")} title="Souligné"><u>U</u></ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="Barré"><s>S</s></ToolBtn>
                  <Divider />
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleHeading({level:1}).run()} active={editor?.isActive("heading",{level:1})} title="H1">H1</ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleHeading({level:2}).run()} active={editor?.isActive("heading",{level:2})} title="H2">H2</ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleHeading({level:3}).run()} active={editor?.isActive("heading",{level:3})} title="H3">H3</ToolBtn>
                  <Divider />
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Liste">•—</ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Numérotée">1.</ToolBtn>
                  <Divider />
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleCode().run()} active={editor?.isActive("code")} title="Code">`</ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive("codeBlock")} title="Bloc code">{`</>`}</ToolBtn>
                  <ToolBtn onClick={()=>editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Citation">"</ToolBtn>
                  <Divider />
                  <button type="button" onClick={()=>setShowLatexHelper(!showLatexHelper)} style={{ padding:"0 12px", height:30, borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"monospace", background:showLatexHelper?"rgba(6,214,232,0.2)":"rgba(6,214,232,0.08)", color:showLatexHelper?"var(--cyan)":"rgba(6,214,232,0.7)", border:showLatexHelper?"1px solid rgba(6,214,232,0.4)":"1px solid rgba(6,214,232,0.15)" }}>∑ LaTeX</button>
                  <Divider />
                  <ToolBtn onClick={()=>editor?.chain().focus().setHorizontalRule().run()} active={false} title="Séparateur">—</ToolBtn>
                  <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
                    <ToolBtn onClick={()=>editor?.chain().focus().undo().run()} active={false} title="Annuler">↩</ToolBtn>
                    <ToolBtn onClick={()=>editor?.chain().focus().redo().run()} active={false} title="Rétablir">↪</ToolBtn>
                  </div>
                </div>
                {editor ? <EditorContent editor={editor} /> : <div style={{ padding:24, color:"var(--text-muted)", fontStyle:"italic" }}>Chargement...</div>}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <p style={{ fontSize:12, color:"var(--text-muted)" }}>
                  <kbd style={{ background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)", borderRadius:4, padding:"1px 5px", fontSize:11 }}>Ctrl+B</kbd> gras ·{" "}
                  <kbd style={{ background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)", borderRadius:4, padding:"1px 5px", fontSize:11 }}>Ctrl+I</kbd> italique
                </p>
                <p style={{ fontSize:12, color:"var(--text-muted)" }}>{wordCount} mots</p>
              </div>
            </>
          )}
        </div>
      </AppShell>
    </>
  );
}

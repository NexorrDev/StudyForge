"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

function ToolBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onClick={onClick} style={{
      minWidth: 32, height: 30, padding: "0 8px", borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, cursor: "pointer", transition: "all 0.15s",
      fontFamily: "var(--font-syne,sans-serif)", fontWeight: 700,
      background: active ? "rgba(124,58,237,0.3)" : "transparent",
      color: active ? "var(--primary-light)" : "var(--text-secondary)",
      border: active ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="var(--text-primary)"; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-secondary)"; }}}>
      {children}
    </button>
  );
}
function Divider() { return <div style={{ width:1, height:20, background:"var(--border)", margin:"0 4px" }} />; }

// Render KaTeX in the editor view
function renderLatex(html: string): string {
  if (typeof window === "undefined") return html;
  // Replace $$...$$ (block) and $...$ (inline) with rendered HTML
  return html
    .replace(/\$\$([^$]+)\$\$/g, (_, expr) => {
      try {
        // @ts-ignore
        return `<span class="katex-block">${window.katex?.renderToString(expr, { displayMode: true, throwOnError: false }) || expr}</span>`;
      } catch { return expr; }
    })
    .replace(/\$([^$\n]+)\$/g, (_, expr) => {
      try {
        // @ts-ignore
        return `<span class="katex-inline">${window.katex?.renderToString(expr, { displayMode: false, throwOnError: false }) || expr}</span>`;
      } catch { return expr; }
    });
}

export default function NoteEditorPage({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [deckTitle, setDeckTitle] = useState("");
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [genMsg, setGenMsg] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showLatexHelper, setShowLatexHelper] = useState(false);
  const [latexInput, setLatexInput] = useState("");
  const [latexPreview, setLatexPreview] = useState("");
  const [katexLoaded, setKatexLoaded] = useState(false);

  // Load KaTeX dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).katex) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
      script.onload = () => setKatexLoaded(true);
      document.head.appendChild(script);
    } else if ((window as any).katex) {
      setKatexLoaded(true);
    }
  }, []);

  // Live LaTeX preview
  useEffect(() => {
    if (!katexLoaded || !latexInput) { setLatexPreview(""); return; }
    try {
      const rendered = (window as any).katex.renderToString(latexInput, { displayMode: true, throwOnError: false });
      setLatexPreview(rendered);
    } catch { setLatexPreview("Erreur de syntaxe"); }
  }, [latexInput, katexLoaded]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1,2,3] } }),
      Underline,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-editor-inner",
        style: "outline:none; min-height:420px; padding:24px; font-size:15px; line-height:1.8; color:var(--text-primary); font-family:var(--font-dm-sans,sans-serif);",
      },
    },
    onUpdate: ({ editor }) => {
      setWordCount(editor.getText().split(/\s+/).filter(Boolean).length);
    },
  });

  useEffect(() => {
    if (noteId && editor) {
      fetch(`/api/notes/${noteId}`).then(r => r.json()).then(d => {
        setTitle(d.title || "");
        setSubject(d.subject || "");
        setTags((d.tags || []).join(", "));
        if (d.content) editor.commands.setContent(d.content);
      });
    }
  }, [noteId, editor]);

  const handleSave = async () => {
    if (!title.trim() || !editor) return;
    setSaving(true);
    const body = { title, content: editor.getHTML(), subject, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean) };
    if (noteId) {
      await fetch(`/api/notes/${noteId}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    } else {
      const res = await fetch("/api/notes", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (res.ok) { const note = await res.json(); router.replace(`/notes/${note.id}`); }
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const insertLatex = (display: boolean) => {
    if (!editor || !latexInput.trim()) return;
    const tex = display ? `$$${latexInput}$$` : `$${latexInput}$`;
    editor.chain().focus().insertContent(tex + " ").run();
    setLatexInput(""); setShowLatexHelper(false);
  };

  const handleGenerate = async () => {
    if (!editor) return;
    const content = editor.getText();
    if (!content.trim() && !title.trim()) { setGenMsg("Ajoute du contenu à ta fiche d'abord !"); return; }
    setGenerating(true); setGenMsg("");
    const res = await fetch("/api/cards/generate", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ noteTitle:title, noteContent:content, count:genCount }),
    });
    if (!res.ok) { const err = await res.json(); setGenMsg(err.error || "Erreur."); setGenerating(false); return; }
    const data = await res.json();
    if (!data.flashcards?.length) { setGenMsg("Aucune carte générée."); setGenerating(false); return; }
    const deckRes = await fetch("/api/decks", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ title:deckTitle||title, subject }) });
    const deck = await deckRes.json();
    await fetch(`/api/decks/${deck.id}/flashcards`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data.flashcards) });
    setGenerating(false);
    setGenMsg(`✓ ${data.flashcards.length} cartes créées dans "${deck.title}"`);
  };

  const iStyle: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-primary)", fontSize:14, outline:"none", fontFamily:"var(--font-dm-sans,sans-serif)", transition:"border-color 0.2s" };

  const LATEX_EXAMPLES = [
    { label:"Fraction", code:"\\frac{a}{b}" },
    { label:"Puissance", code:"x^{n}" },
    { label:"Intégrale", code:"\\int_0^\\infty f(x)dx" },
    { label:"Somme", code:"\\sum_{i=1}^{n} x_i" },
    { label:"Racine", code:"\\sqrt{x^2+y^2}" },
    { label:"Vecteur", code:"\\vec{F} = m\\vec{a}" },
    { label:"Grec", code:"\\alpha, \\beta, \\gamma, \\Delta" },
    { label:"E=mc²", code:"E = mc^2" },
  ];

  return (
    <>
      <style>{`
        .tiptap-editor-inner h1{font-size:26px;font-weight:800;margin:20px 0 12px;font-family:var(--font-syne,sans-serif);color:var(--text-primary);}
        .tiptap-editor-inner h2{font-size:20px;font-weight:700;margin:16px 0 10px;font-family:var(--font-syne,sans-serif);color:var(--text-primary);}
        .tiptap-editor-inner h3{font-size:16px;font-weight:600;margin:14px 0 8px;font-family:var(--font-syne,sans-serif);color:var(--primary-light);}
        .tiptap-editor-inner p{margin-bottom:10px;}
        .tiptap-editor-inner strong{color:var(--primary-light);font-weight:700;}
        .tiptap-editor-inner em{color:var(--cyan);font-style:italic;}
        .tiptap-editor-inner u{text-decoration:underline;text-decoration-color:var(--amber);}
        .tiptap-editor-inner s{text-decoration:line-through;color:var(--text-muted);}
        .tiptap-editor-inner code{background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.25);border-radius:6px;padding:2px 8px;font-size:13px;color:var(--primary-light);font-family:monospace;}
        .tiptap-editor-inner pre{background:rgba(0,0,0,0.5);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin:14px 0;overflow-x:auto;}
        .tiptap-editor-inner pre code{background:none;border:none;padding:0;font-size:13px;color:var(--cyan);}
        .tiptap-editor-inner blockquote{border-left:3px solid var(--primary);padding-left:16px;margin:14px 0;color:var(--text-secondary);font-style:italic;}
        .tiptap-editor-inner ul{padding-left:22px;margin-bottom:12px;list-style:disc;}
        .tiptap-editor-inner ol{padding-left:22px;margin-bottom:12px;list-style:decimal;}
        .tiptap-editor-inner li{margin-bottom:4px;}
        .tiptap-editor-inner hr{border:none;border-top:1px solid var(--border);margin:20px 0;}
        .tiptap-editor-inner ::selection{background:rgba(124,58,237,0.3);}
        .katex-block{display:block;text-align:center;margin:16px 0;padding:12px;background:rgba(124,58,237,0.06);border-radius:10px;border:1px solid var(--border);}
        .katex-inline{display:inline;padding:0 2px;}
      `}</style>

      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:20, position:"relative", zIndex:1 }} className="animate-slide-up">

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <Link href="/notes" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", display:"inline-block", marginBottom:6 }}>← Retour</Link>
              <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:26, color:"var(--text-primary)" }}>{noteId?"Éditer la fiche":"Nouvelle fiche"}</h1>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowGenPanel(!showGenPanel)} style={{ padding:"10px 16px", borderRadius:12, border:"1px solid rgba(124,58,237,0.3)", background:"rgba(124,58,237,0.1)", color:"var(--primary-light)", cursor:"pointer", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>✦ IA → Flashcards</button>
              <button onClick={handleSave} disabled={saving||!title.trim()} style={{ padding:"10px 22px", borderRadius:12, border:"none", cursor:saving?"not-allowed":"pointer", background:"linear-gradient(135deg,var(--primary),var(--primary-light))", color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:14, opacity:saving||!title.trim()?0.6:1 }}>
                {saving?"Sauvegarde...":saved?"✓ Sauvegardé !":"💾 Sauvegarder"}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:14 }}>
            {[{label:"Titre *",ph:"ex: Mécanique Quantique",val:title,set:setTitle},{label:"Matière",ph:"ex: Physique",val:subject,set:setSubject},{label:"Tags (virgules)",ph:"ex: quantique, ondes",val:tags,set:setTags}].map(f=>(
              <div key={f.label}>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{f.label}</label>
                <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={iStyle}
                  onFocus={e=>e.target.style.borderColor="var(--border-bright)"}
                  onBlur={e=>e.target.style.borderColor="var(--border)"} />
              </div>
            ))}
          </div>

          {/* AI panel */}
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
                  {generating?"Génération...":"Générer →"}
                </button>
              </div>
              {genMsg&&<p style={{ marginTop:10, fontSize:13, color:genMsg.startsWith("✓")?"var(--emerald)":"var(--rose)" }}>{genMsg}</p>}
            </div>
          )}

          {/* LaTeX helper panel */}
          {showLatexHelper && (
            <div style={{ padding:18, borderRadius:14, background:"rgba(6,214,232,0.04)", border:"1px solid rgba(6,214,232,0.2)" }}>
              <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, marginBottom:14, color:"var(--text-primary)" }}>∑ Insérer une équation LaTeX</h3>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                {LATEX_EXAMPLES.map(ex=>(
                  <button key={ex.label} onClick={()=>setLatexInput(ex.code)}
                    style={{ padding:"5px 12px", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, background:"rgba(6,214,232,0.1)", color:"var(--cyan)", border:"1px solid rgba(6,214,232,0.2)" }}>
                    {ex.label}
                  </button>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Code LaTeX</label>
                  <input value={latexInput} onChange={e=>setLatexInput(e.target.value)} placeholder="ex: \frac{1}{2}mv^2" style={{...iStyle, fontFamily:"monospace"}}
                    onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); insertLatex(true); }}}/>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Aperçu</label>
                  <div style={{ minHeight:44, padding:"10px 14px", borderRadius:10, background:"rgba(0,0,0,0.3)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}
                    dangerouslySetInnerHTML={{ __html: latexPreview || '<span style="color:var(--text-muted);font-style:italic;font-size:13px">Tapez une formule...</span>' }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <button onClick={()=>insertLatex(false)} disabled={!latexInput.trim()} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:!latexInput.trim()?"not-allowed":"pointer", background:"rgba(6,214,232,0.15)", color:"var(--cyan)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:!latexInput.trim()?0.5:1 }}>Insérer en ligne</button>
                <button onClick={()=>insertLatex(true)} disabled={!latexInput.trim()} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:!latexInput.trim()?"not-allowed":"pointer", background:"rgba(124,58,237,0.2)", color:"var(--primary-light)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:!latexInput.trim()?0.5:1 }}>Insérer en bloc</button>
                <button onClick={()=>setShowLatexHelper(false)} style={{ padding:"8px 18px", borderRadius:10, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>Fermer</button>
              </div>
            </div>
          )}

          {/* Editor */}
          <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid var(--border)", background:"var(--bg-card)" }}>
            {/* Toolbar */}
            <div style={{ display:"flex", alignItems:"center", gap:2, padding:"8px 12px", background:"rgba(0,0,0,0.25)", borderBottom:"1px solid var(--border)", flexWrap:"wrap" }}>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Gras (Ctrl+B)"><strong>B</strong></ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italique (Ctrl+I)"><em>I</em></ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")} title="Souligné (Ctrl+U)"><u>U</u></ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="Barré"><s>S</s></ToolBtn>
              <Divider />
              <ToolBtn onClick={()=>editor?.chain().focus().toggleHeading({level:1}).run()} active={editor?.isActive("heading",{level:1})} title="Titre 1">H1</ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleHeading({level:2}).run()} active={editor?.isActive("heading",{level:2})} title="Titre 2">H2</ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleHeading({level:3}).run()} active={editor?.isActive("heading",{level:3})} title="Titre 3">H3</ToolBtn>
              <Divider />
              <ToolBtn onClick={()=>editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Liste à puces">•—</ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Liste numérotée">1.</ToolBtn>
              <Divider />
              <ToolBtn onClick={()=>editor?.chain().focus().toggleCode().run()} active={editor?.isActive("code")} title="Code inline">`</ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive("codeBlock")} title="Bloc de code">{`</>`}</ToolBtn>
              <ToolBtn onClick={()=>editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Citation">"</ToolBtn>
              <Divider />
              {/* LaTeX button — highlighted */}
              <button type="button" onClick={()=>setShowLatexHelper(!showLatexHelper)} title="Insérer une équation LaTeX"
                style={{ padding:"0 12px", height:30, borderRadius:6, cursor:"pointer", transition:"all 0.15s", fontSize:14, fontWeight:700, fontFamily:"monospace",
                  background:showLatexHelper?"rgba(6,214,232,0.2)":"rgba(6,214,232,0.08)",
                  color:showLatexHelper?"var(--cyan)":"var(--text-secondary)",
                  border:showLatexHelper?"1px solid rgba(6,214,232,0.4)":"1px solid rgba(6,214,232,0.2)" }}>
                ∑ LaTeX
              </button>
              <Divider />
              <ToolBtn onClick={()=>editor?.chain().focus().setHorizontalRule().run()} active={false} title="Séparateur">—</ToolBtn>
              <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
                <ToolBtn onClick={()=>editor?.chain().focus().undo().run()} active={false} title="Annuler (Ctrl+Z)">↩</ToolBtn>
                <ToolBtn onClick={()=>editor?.chain().focus().redo().run()} active={false} title="Rétablir">↪</ToolBtn>
              </div>
            </div>
            {editor ? <EditorContent editor={editor} /> : <div style={{ padding:24, color:"var(--text-muted)", fontStyle:"italic" }}>Chargement...</div>}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ fontSize:12, color:"var(--text-muted)" }}>
              <kbd style={{ background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)", borderRadius:4, padding:"1px 5px", fontSize:11 }}>Ctrl+B</kbd> gras ·{" "}
              <kbd style={{ background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)", borderRadius:4, padding:"1px 5px", fontSize:11 }}>Ctrl+I</kbd> italique ·{" "}
              <kbd style={{ background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)", borderRadius:4, padding:"1px 5px", fontSize:11 }}>Ctrl+Z</kbd> annuler
            </p>
            <p style={{ fontSize:12, color:"var(--text-muted)" }}>{wordCount} mots</p>
          </div>
        </div>
      </AppShell>
    </>
  );
}

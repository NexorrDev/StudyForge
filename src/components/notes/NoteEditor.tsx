"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

function isFullHtml(content: string): boolean {
  const t = content.trim();
  return t.startsWith("<!DOCTYPE") || t.startsWith("<html");
}

function NoteViewer({ html }: { html: string }) {
  const [rendered, setRendered] = useState(html);

  useEffect(() => {
    if (isFullHtml(html)) { setRendered(html); return; }
    const w = window as any;
    const doRender = () => {
      let out = html;
      out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_, e) => {
        try { return `<div style="text-align:center;margin:12px 0;padding:10px;background:rgba(6,214,232,0.05);border-radius:8px">${w.katex.renderToString(e.trim(), { displayMode: true, throwOnError: false })}</div>`; }
        catch { return e; }
      });
      out = out.replace(/\$([^$\n]+?)\$/g, (_, e) => {
        try { return w.katex.renderToString(e.trim(), { displayMode: false, throwOnError: false }); }
        catch { return e; }
      });
      setRendered(out);
    };
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
    return <iframe srcDoc={html} style={{ width:"100%", height:700, border:"none", display:"block" }} title="Fiche" sandbox="allow-scripts" />;
  }
  return (
    <div className="note-viewer" dangerouslySetInnerHTML={{ __html: rendered }}
      style={{ padding:28, minHeight:300, lineHeight:1.8, fontSize:15, color:"var(--text-primary)", fontFamily:"var(--font-dm-sans,sans-serif)" }} />
  );
}

export default function NoteEditorPage({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const [title, setTitle]     = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags]       = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [isAiNote, setIsAiNote] = useState(false);
  // flashcard gen
  const [genCount, setGenCount]     = useState(15);
  const [deckTitle, setDeckTitle]   = useState("");
  const [showGen, setShowGen]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg]         = useState("");
  // title edit for AI notes
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle]     = useState("");

  useEffect(() => {
    if (!noteId) return;
    fetch(`/api/notes/${noteId}`).then(r => r.json()).then(d => {
      setTitle(d.title || "");
      setSubject(d.subject || "");
      setTags((d.tags || []).join(", "));
      setContent(d.content || "");
      setIsAiNote(isFullHtml(d.content || ""));
    });
  }, [noteId]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const body = { title, content, subject, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean) };
    if (noteId) {
      await fetch(`/api/notes/${noteId}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    } else {
      const res = await fetch("/api/notes", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (res.ok) { const note = await res.json(); router.replace(`/notes/${note.id}`); }
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveTitle = async () => {
    if (!draftTitle.trim() || !noteId) return;
    setSaving(true);
    await fetch(`/api/notes/${noteId}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ title: draftTitle.trim(), content, subject, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean) }),
    });
    setTitle(draftTitle.trim());
    setEditingTitle(false);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleGenerate = async () => {
    setGenerating(true); setGenMsg("");
    const text = isAiNote ? title : content.replace(/<[^>]+>/g, " ");
    const res = await fetch("/api/cards/generate", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ noteTitle: title, noteContent: text, count: genCount }),
    });
    if (!res.ok) { const e = await res.json(); setGenMsg(e.error || "Erreur"); setGenerating(false); return; }
    const data = await res.json();
    if (!data.flashcards?.length) { setGenMsg("Aucune carte générée."); setGenerating(false); return; }
    const dr = await fetch("/api/decks", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ title: deckTitle||title, subject }) });
    const deck = await dr.json();
    await fetch(`/api/decks/${deck.id}/flashcards`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data.flashcards) });
    setGenerating(false);
    setGenMsg(`✓ ${data.flashcards.length} cartes créées dans "${deck.title}"`);
  };

  const iStyle: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-primary)", fontSize:14, outline:"none", fontFamily:"var(--font-dm-sans,sans-serif)", transition:"border-color 0.2s" };

  return (
    <>
      <style>{`
        .note-viewer h1{font-size:24px;font-weight:800;margin:18px 0 10px;font-family:var(--font-syne,sans-serif);color:var(--text-primary);}
        .note-viewer h2{font-size:19px;font-weight:700;margin:14px 0 8px;font-family:var(--font-syne,sans-serif);color:var(--text-primary);}
        .note-viewer h3{font-size:15px;font-weight:600;margin:12px 0 6px;color:var(--primary-light);}
        .note-viewer p{margin-bottom:10px;}
        .note-viewer strong{color:var(--primary-light);font-weight:700;}
        .note-viewer em{color:var(--cyan);}
        .note-viewer code{background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.25);border-radius:5px;padding:2px 7px;font-size:13px;color:var(--primary-light);font-family:monospace;}
        .note-viewer blockquote{border-left:3px solid var(--primary);padding-left:14px;margin:12px 0;color:var(--text-secondary);}
        .note-viewer ul{padding-left:20px;list-style:disc;margin-bottom:10px;}
        .note-viewer ol{padding-left:20px;list-style:decimal;margin-bottom:10px;}
      `}</style>

      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:20, position:"relative", zIndex:1 }} className="animate-slide-up">

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <Link href="/notes" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", display:"inline-block", marginBottom:6 }}>← Retour</Link>

              {/* Title — always editable */}
              {editingTitle ? (
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <input value={draftTitle} onChange={e=>setDraftTitle(e.target.value)}
                    autoFocus
                    onKeyDown={e=>{ if(e.key==="Enter") handleSaveTitle(); if(e.key==="Escape") setEditingTitle(false); }}
                    style={{ ...iStyle, fontSize:22, fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, flex:1 }} />
                  <button onClick={handleSaveTitle} disabled={saving} style={{ padding:"9px 18px", borderRadius:10, border:"none", cursor:"pointer", background:"var(--primary)", color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13 }}>
                    {saving ? "..." : "✓"}
                  </button>
                  <button onClick={()=>setEditingTitle(false)} style={{ padding:"9px 14px", borderRadius:10, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>✕</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:26, color:"var(--text-primary)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {title || (noteId ? "Fiche" : "Nouvelle fiche")}
                  </h1>
                  {noteId && (
                    <button onClick={()=>{ setDraftTitle(title); setEditingTitle(true); }}
                      title="Renommer"
                      style={{ padding:"4px 10px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--text-muted)", cursor:"pointer", fontSize:12, flexShrink:0, transition:"all 0.15s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.color="var(--text-primary)"; e.currentTarget.style.borderColor="var(--border-bright)"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.borderColor="var(--border)"; }}>
                      ✏️ Renommer
                    </button>
                  )}
                  {saved && <span style={{ fontSize:12, color:"var(--emerald)" }}>✓ Sauvegardé</span>}
                  {isAiNote && <span style={{ fontSize:11, padding:"2px 10px", borderRadius:20, background:"rgba(245,158,11,0.12)", color:"var(--amber)", fontWeight:600, border:"1px solid rgba(245,158,11,0.25)" }}>✦ IA</span>}
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:10, flexShrink:0 }}>
              <button onClick={()=>setShowGen(!showGen)} style={{ padding:"9px 16px", borderRadius:12, border:"1px solid rgba(124,58,237,0.3)", background:"rgba(124,58,237,0.1)", color:"var(--primary-light)", cursor:"pointer", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:13 }}>✦ Flashcards</button>
              {!isAiNote && (
                <button onClick={handleSave} disabled={saving||!title.trim()} style={{ padding:"9px 20px", borderRadius:12, border:"none", cursor:"pointer", background:"linear-gradient(135deg,var(--primary),var(--primary-light))", color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:saving||!title.trim()?0.6:1 }}>
                  {saving ? "Sauvegarde..." : "💾 Sauvegarder"}
                </button>
              )}
            </div>
          </div>

          {/* Flashcard generation panel */}
          {showGen && (
            <div style={{ padding:18, borderRadius:14, background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.2)" }}>
              <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, marginBottom:12, color:"var(--text-primary)" }}>✦ Générer des flashcards</h3>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr auto", gap:12, alignItems:"flex-end" }}>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Nom du deck</label>
                  <input value={deckTitle} onChange={e=>setDeckTitle(e.target.value)} placeholder={title} style={iStyle} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Nb cartes</label>
                  <input type="number" value={genCount} onChange={e=>setGenCount(Number(e.target.value))} min={1} max={50} style={{...iStyle,textAlign:"center"}} />
                </div>
                <button onClick={handleGenerate} disabled={generating} style={{ padding:"11px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"var(--primary)", color:"white", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, opacity:generating?0.7:1 }}>
                  {generating ? "..." : "Générer →"}
                </button>
              </div>
              {genMsg && <p style={{ marginTop:10, fontSize:13, color:genMsg.startsWith("✓")?"var(--emerald)":"var(--rose)" }}>{genMsg}</p>}
            </div>
          )}

          {/* Content */}
          <div style={{ borderRadius:16, border:"1px solid var(--border)", background:isAiNote?"#0a0a0f":"var(--bg-card)", overflow:"hidden" }}>
            {!isAiNote && (
              <div style={{ padding:"10px 20px", background:"rgba(0,0,0,0.2)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:"var(--text-secondary)", fontFamily:"var(--font-syne,sans-serif)", fontWeight:600 }}>Fiche</span>
                {tags && tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=>(
                  <span key={t} style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(6,214,232,0.08)", color:"var(--cyan)", border:"1px solid rgba(6,214,232,0.15)" }}>#{t}</span>
                ))}
              </div>
            )}
            {content
              ? <NoteViewer html={content} />
              : <div style={{ padding:40, textAlign:"center", color:"var(--text-muted)", fontStyle:"italic" }}>Fiche vide</div>
            }
          </div>
        </div>
      </AppShell>
    </>
  );
}
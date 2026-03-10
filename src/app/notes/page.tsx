"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = (search = "") =>
    fetch(`/api/notes${search ? "?q="+encodeURIComponent(search) : ""}`)
      .then(r => r.json()).then(d => { setNotes(Array.isArray(d) ? d : []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleSearch = (v: string) => { setQ(v); load(v); };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette fiche ?")) return;
    await fetch(`/api/notes/${id}`, { method:"DELETE" });
    load(q);
  };

  const subjects = Array.from(new Set(notes.map(n => n.subject).filter(Boolean)));
  const fmt = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff/3600000);
    if (h < 1) return "il y a moins d'1h";
    if (h < 24) return `il y a ${h}h`;
    const days = Math.floor(h/24);
    return `il y a ${days}j`;
  };

  return (
    <><AmbientBackground /><AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:28, position:"relative", zIndex:1 }} className="animate-slide-up">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:36, color:"var(--text-primary)" }}>Fiches de révision</h1>
            <p style={{ marginTop:8, color:"var(--text-secondary)" }}>{notes.length} fiches{subjects.length > 0 ? ` · ${subjects.length} matières` : ""}</p>
          </div>
          <Link href="/notes/new" style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, color:"white", textDecoration:"none", background:"linear-gradient(135deg,var(--primary),var(--primary-light))", boxShadow:"0 4px 20px var(--primary-glow)" }}>✦ Nouvelle fiche</Link>
        </div>

        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }}>🔍</span>
          <input value={q} onChange={e => handleSearch(e.target.value)} placeholder="Rechercher dans vos fiches..."
            style={{ width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, color:"var(--text-primary)", fontSize:14, outline:"none", padding:"12px 16px 12px 42px", fontFamily:"var(--font-dm-sans,sans-serif)" }} />
        </div>

        {loading ? (
          <p style={{ color:"var(--text-secondary)", textAlign:"center", padding:40 }}>Chargement...</p>
        ) : notes.length === 0 ? (
          <div style={{ padding:60, textAlign:"center", borderRadius:16, border:"1px dashed var(--border)" }}>
            <p style={{ fontSize:40, marginBottom:16 }}>📖</p>
            <p style={{ color:"var(--text-secondary)", marginBottom:20 }}>Aucune fiche pour le moment</p>
            <Link href="/notes/new" style={{ padding:"12px 24px", borderRadius:12, background:"var(--primary)", color:"white", textDecoration:"none", fontWeight:700 }}>Créer ma première fiche</Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {notes.map(note => (
              <div key={note.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderRadius:16, border:"1px solid var(--border)", background:"var(--bg-card)", transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="var(--bg-card-hover)"; e.currentTarget.style.borderColor="var(--border-bright)"; e.currentTarget.style.transform="translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="var(--bg-card)"; e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateX(0)"; }}>
                <Link href={"/notes/"+note.id} style={{ flex:1, textDecoration:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:14, color:"var(--text-primary)" }}>{note.title}</h3>
                    {note.subject && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(124,58,237,0.15)", color:"var(--primary-light)", fontWeight:600 }}>{note.subject}</span>}
                  </div>
                  {note.content && <p style={{ fontSize:12, color:"var(--text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:600 }}>{note.content.replace(/<[^>]+>/g, "").substring(0, 120)}</p>}
                  {note.tags?.length > 0 && (
                    <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                      {note.tags.slice(0,4).map((t: string) => <span key={t} style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(6,214,232,0.08)", color:"var(--cyan)", border:"1px solid rgba(6,214,232,0.15)" }}>#{t}</span>)}
                    </div>
                  )}
                </Link>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginLeft:16, flexShrink:0 }}>
                  <span style={{ fontSize:11, color:"var(--text-muted)" }}>{fmt(note.updatedAt)}</span>
                  <Link href={"/notes/"+note.id} style={{ padding:"6px 12px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--text-secondary)", textDecoration:"none", fontSize:12, fontWeight:600 }}>Éditer</Link>
                  <button onClick={() => handleDelete(note.id)} style={{ padding:"6px 12px", borderRadius:8, border:"1px solid rgba(244,63,94,0.3)", background:"rgba(244,63,94,0.08)", color:"var(--rose)", cursor:"pointer", fontSize:12, fontWeight:600 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell></>
  );
}

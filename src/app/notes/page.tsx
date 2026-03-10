import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

const SUBJECTS = [
  { name:"Physique", icon:"⚛️", color:"#7C3AED", count:12 },
  { name:"Mathematiques", icon:"∑", color:"#06D6E8", count:9 },
  { name:"Chimie", icon:"⚗️", color:"#10B981", count:7 },
  { name:"Histoire", icon:"📜", color:"#F59E0B", count:5 },
];

const NOTES = [
  { id:"1", title:"Equations de Maxwell", subject:"Physique", tags:["electromagnetisme","champs"], updated:"Il y a 2h", preview:"Les 4 equations de Maxwell gouvernent les phenomenes electromagnetiques..." },
  { id:"2", title:"Integrales curvilignes", subject:"Maths", tags:["analyse","integration"], updated:"Hier", preview:"Une integrale curviligne est une generalisation de l'integrale definie..." },
  { id:"3", title:"Cinetique chimique", subject:"Chimie", tags:["reactions","vitesse"], updated:"Il y a 3j", preview:"La loi d'Arrhenius decrit la dependance de la constante de vitesse..." },
  { id:"4", title:"Revolution francaise", subject:"Histoire", tags:["politique","18e siecle"], updated:"Il y a 7j", preview:"De 1789 a 1799, la France connait une periode de profonds bouleversements..." },
];

export default function NotesPage() {
  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:32, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <h1 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:36, color:"var(--text-primary)" }}>Fiches de revision</h1>
              <p style={{ marginTop:8, color:"var(--text-secondary)" }}>{NOTES.length} fiches dans {SUBJECTS.length} matieres</p>
            </div>
            <Link href="/notes/new" style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
              fontWeight:700, fontSize:13, color:"white", textDecoration:"none",
              background:"linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow:"0 4px 20px var(--primary-glow)" }}>
              ✦ Nouvelle fiche
            </Link>
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}>🔍</span>
            <input placeholder="Rechercher dans vos fiches, tags, formules..."
              style={{ width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12,
                color:"var(--text-primary)", fontSize:14, outline:"none", padding:"12px 16px 12px 42px",
                fontFamily:"var(--font-dm-sans, DM Sans), sans-serif" }} />
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:15, marginBottom:16, color:"var(--text-primary)" }}>Matieres</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {SUBJECTS.map(s => (
                <div key={s.name} style={{ padding:16, borderRadius:16, border:"1px solid var(--border)", background:"var(--bg-card)",
                  cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border-bright)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
                  <p style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:14, color:s.color }}>{s.name}</p>
                  <p style={{ fontSize:12, marginTop:4, color:"var(--text-secondary)" }}>{s.count} fiches</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:15, marginBottom:16, color:"var(--text-primary)" }}>Recemment modifiees</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {NOTES.map(note => (
                <Link key={note.id} href={"/notes/" + note.id}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px",
                    borderRadius:16, border:"1px solid var(--border)", background:"var(--bg-card)",
                    cursor:"pointer", transition:"all 0.2s", textDecoration:"none" }}
                  onMouseEnter={e => { e.currentTarget.style.background="var(--bg-card-hover)"; e.currentTarget.style.borderColor="var(--border-bright)"; e.currentTarget.style.transform="translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="var(--bg-card)"; e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateX(0)"; }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:14, color:"var(--text-primary)" }}>{note.title}</h3>
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(124,58,237,0.15)", color:"var(--primary-light)", fontWeight:600 }}>{note.subject}</span>
                    </div>
                    <p style={{ fontSize:12, color:"var(--text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{note.preview}</p>
                    <div style={{ display:"flex", gap:6, marginTop:6 }}>
                      {note.tags.map(t => (
                        <span key={t} style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(6,214,232,0.08)", color:"var(--cyan)", border:"1px solid rgba(6,214,232,0.15)" }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginLeft:16, textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontSize:11, color:"var(--text-muted)" }}>{note.updated}</p>
                    <span style={{ fontSize:14, color:"var(--text-muted)" }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}

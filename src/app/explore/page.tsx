import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

const PUBLIC_DECKS = [
  { id:"p1", title:"Terminale Physique-Chimie", subject:"Physique", author:"Marie L.", cards:120, stars:342, color:"#7C3AED" },
  { id:"p2", title:"Maths Sup - Analyse", subject:"Maths", author:"Thomas B.", cards:85, stars:218, color:"#06D6E8" },
  { id:"p3", title:"Chimie Organique PACES", subject:"Chimie", author:"Sophie M.", cards:200, stars:567, color:"#10B981" },
  { id:"p4", title:"Histoire Contemporaine", subject:"Histoire", author:"Lucas R.", cards:65, stars:143, color:"#F59E0B" },
  { id:"p5", title:"Vocabulaire Anglais B2/C1", subject:"Anglais", author:"Emma T.", cards:300, stars:891, color:"#F43F5E" },
  { id:"p6", title:"Anatomie - Systeme nerveux", subject:"Medecine", author:"Pierre V.", cards:150, stars:445, color:"#8B5CF6" },
];

const FILTERS = ["Tous","Physique","Maths","Chimie","Histoire","Medecine","Langues"];

export default function ExplorePage() {
  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:32, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div>
            <h1 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:36, color:"var(--text-primary)" }}>Explorer</h1>
            <p style={{ marginTop:8, color:"var(--text-secondary)" }}>Decouvre des decks crees par la communaute</p>
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}>🔍</span>
            <input placeholder="Rechercher des decks publics..."
              style={{ width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12,
                color:"var(--text-primary)", fontSize:14, outline:"none", padding:"12px 16px 12px 42px",
                fontFamily:"var(--font-dm-sans, DM Sans), sans-serif" }} />
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {FILTERS.map((f,i) => (
              <button key={f} style={{ padding:"8px 16px", borderRadius:20, fontSize:13, cursor:"pointer",
                fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:600,
                background: i===0 ? "var(--primary)" : "var(--bg-card)",
                color: i===0 ? "white" : "var(--text-secondary)",
                border: `1px solid ${i===0 ? "var(--primary)" : "var(--border)"}` }}>{f}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {PUBLIC_DECKS.map(deck => (
              <div key={deck.id} style={{ padding:20, borderRadius:16, border:"1px solid var(--border)", background:"var(--bg-card)",
                cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border-bright)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"16px 16px 0 0",
                  background:`linear-gradient(90deg, ${deck.color}, transparent)` }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <span style={{ fontSize:10, fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.05em", padding:"2px 8px", borderRadius:20,
                    background:`${deck.color}18`, color:deck.color, border:`1px solid ${deck.color}30` }}>{deck.subject}</span>
                  <span style={{ fontSize:12, color:"var(--amber)" }}>⭐ {deck.stars}</span>
                </div>
                <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:14, color:"var(--text-primary)", marginBottom:4 }}>{deck.title}</h3>
                <p style={{ fontSize:12, color:"var(--text-secondary)", marginBottom:12 }}>par {deck.author} · {deck.cards} cartes</p>
                <button style={{ width:"100%", padding:"8px 0", borderRadius:10, fontSize:12, cursor:"pointer",
                  fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:600, transition:"all 0.2s",
                  background:`${deck.color}15`, color:deck.color, border:`1px solid ${deck.color}30` }}>
                  + Ajouter a ma bibliotheque
                </button>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </>
  );
}

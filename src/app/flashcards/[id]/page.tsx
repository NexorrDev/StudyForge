import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

const CARDS = [
  { id:"1", front:"Quelle est la formule de l'energie cinetique ?", back:"Ek = 1/2 mv²" },
  { id:"2", front:"Enoncer le principe d'Heisenberg", back:"Dx * Dp >= h/2" },
  { id:"3", front:"Qu'est-ce que l'enthalpie libre de Gibbs ?", back:"G = H - TS" },
  { id:"4", front:"Definir la fonction d'onde psi", back:"|psi|² = densite de probabilite" },
  { id:"5", front:"Equation de Schrodinger dependante du temps", back:"ih * d(psi)/dt = H * psi" },
];

export default function DeckPage({ params }: { params: { id: string } }) {
  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ display:"flex", flexDirection:"column", gap:32, position:"relative", zIndex:1 }} className="animate-slide-up">
          <div style={{ padding:32, borderRadius:16, position:"relative", overflow:"hidden",
            background:"linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,214,232,0.1))",
            border:"1px solid var(--border-bright)" }}>
            <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, marginBottom:12, display:"inline-block",
              background:"rgba(124,58,237,0.2)", color:"var(--primary-light)", border:"1px solid rgba(124,58,237,0.3)",
              fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:600 }}>Physique</span>
            <h1 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:800, fontSize:30,
              color:"var(--text-primary)", marginBottom:8 }}>Mecanique Quantique</h1>
            <p style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:24 }}>
              {CARDS.length} cartes · 7 a reviser · 72% maitrise
            </p>
            <div style={{ display:"flex", gap:12 }}>
              <Link href={"/flashcards/"+params.id+"/study"}
                style={{ padding:"10px 24px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
                  fontWeight:700, fontSize:14, color:"white", textDecoration:"none",
                  background:"linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow:"0 4px 20px var(--primary-glow)" }}>
                ▶ Reviser maintenant
              </Link>
              <button style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
                fontWeight:600, fontSize:14, cursor:"pointer", background:"rgba(255,255,255,0.06)",
                border:"1px solid var(--border)", color:"var(--text-secondary)" }}>
                🔗 Partager
              </button>
              <button style={{ padding:"10px 20px", borderRadius:12, fontFamily:"var(--font-syne, Syne), sans-serif",
                fontWeight:600, fontSize:14, cursor:"pointer", background:"rgba(255,255,255,0.06)",
                border:"1px solid var(--border)", color:"var(--text-secondary)" }}>
                ✦ Generer avec l'IA
              </button>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:16,
              marginBottom:16, color:"var(--text-primary)" }}>Cartes ({CARDS.length})</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {CARDS.map((card, i) => (
                <div key={card.id} style={{ display:"flex", gap:16, padding:"14px 16px", borderRadius:12,
                  border:"1px solid var(--border)", background:"var(--bg-card)", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border-bright)"; e.currentTarget.style.transform="translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateX(0)"; }}>
                  <span style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:12,
                    color:"var(--text-muted)", minWidth:20, marginTop:2 }}>{i+1}</span>
                  <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <div>
                      <p style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em",
                        color:"var(--text-muted)", marginBottom:4, fontFamily:"var(--font-syne, Syne), sans-serif" }}>Recto</p>
                      <p style={{ fontSize:13, color:"var(--text-primary)" }}>{card.front}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em",
                        color:"var(--primary-light)", marginBottom:4, fontFamily:"var(--font-syne, Syne), sans-serif" }}>Verso</p>
                      <p style={{ fontSize:13, color:"var(--cyan)", fontFamily:"monospace" }}>{card.back}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}

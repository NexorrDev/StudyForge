import Link from "next/link";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const features = [
    { icon:"🃏", title:"SRS Intelligent", desc:"Algorithme SM-2 qui optimise tes révisions au moment parfait" },
    { icon:"∑", title:"Notes & Editor", desc:"Éditeur riche avec support Markdown et génération IA de flashcards" },
    { icon:"🔥", title:"Gamification", desc:"Streaks, XP, niveaux pour rester motivé chaque jour" },
  ];

  return (
    <>
      <AmbientBackground />
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1, padding:"0 24px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:20, marginBottom:32, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"var(--primary-light)", fontSize:12, fontFamily:"var(--font-syne,sans-serif)", fontWeight:600 }}>
          ✦ Révision nouvelle génération · SRS · IA intégrée
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <div style={{ width:64, height:64, borderRadius:20, fontSize:32, background:"linear-gradient(135deg,var(--primary),var(--cyan))", boxShadow:"0 8px 32px var(--primary-glow)", display:"flex", alignItems:"center", justifyContent:"center" }}>🧠</div>
          <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:60, color:"var(--text-primary)", lineHeight:1 }}>StudyForge</h1>
        </div>
        <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:22, color:"var(--text-primary)", marginBottom:14, maxWidth:560 }}>Mémorise plus vite. Oublie moins souvent.</p>
        <p style={{ fontSize:15, color:"var(--text-secondary)", marginBottom:44, maxWidth:460 }}>Flashcards intelligentes, répétition espacée SM-2 et gamification pour transformer ta façon d'étudier.</p>
        <div style={{ display:"flex", gap:14, marginBottom:72 }}>
          <Link href="/auth/register" style={{ padding:"13px 30px", borderRadius:12, fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:15, color:"white", textDecoration:"none", background:"linear-gradient(135deg,var(--primary),var(--primary-light))", boxShadow:"0 6px 24px var(--primary-glow)" }}>
            ▶ Commencer gratuitement
          </Link>
          <Link href="/auth/login" style={{ padding:"13px 30px", borderRadius:12, fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:15, color:"var(--text-secondary)", textDecoration:"none", background:"transparent", border:"1px solid var(--border)" }}>
            Se connecter →
          </Link>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, maxWidth:700, width:"100%" }}>
          {features.map(f => (
            <div key={f.title} style={{ padding:24, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
              <div style={{ fontSize:30, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:14, color:"var(--text-primary)", marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:"var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

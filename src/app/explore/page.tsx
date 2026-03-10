"use client";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function ExplorePage() {
  return (
    <><AmbientBackground /><AppShell>
      <div style={{ display:"flex", flexDirection:"column", gap:28, position:"relative", zIndex:1 }} className="animate-slide-up">
        <div>
          <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:36, color:"var(--text-primary)" }}>Explorer</h1>
          <p style={{ marginTop:8, color:"var(--text-secondary)" }}>Découvre des decks créés par la communauté</p>
        </div>
        <div style={{ padding:80, textAlign:"center", borderRadius:20, border:"1px dashed var(--border)", background:"var(--bg-card)" }}>
          <p style={{ fontSize:48, marginBottom:16 }}>🌍</p>
          <h2 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:22, color:"var(--text-primary)", marginBottom:12 }}>Bientôt disponible</h2>
          <p style={{ color:"var(--text-secondary)", maxWidth:400, margin:"0 auto" }}>
            La bibliothèque communautaire arrive prochainement. En attendant, crée tes propres decks et fiches !
          </p>
        </div>
      </div>
    </AppShell></>
  );
}

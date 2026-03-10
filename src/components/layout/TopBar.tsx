"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function TopBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  // streak from session isn't in JWT, show nothing if not loaded
  return (
    <header style={{ position:"fixed", top:0, right:0, left:220, zIndex:40, display:"flex", alignItems:"center", gap:16, padding:"10px 24px", background:"rgba(6,6,12,0.8)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)" }}>
      <div style={{ flex:1, maxWidth:400, position:"relative" }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }}>🔍</span>
        <input value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && q.trim()) router.push(`/notes?q=${encodeURIComponent(q)}`); }}
          placeholder="Recherche globale... (Entrée)"
          style={{ width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, color:"var(--text-primary)", fontSize:13, outline:"none", padding:"9px 16px 9px 40px", fontFamily:"var(--font-dm-sans,sans-serif)" }}
          onFocus={e => e.target.style.borderColor="var(--border-bright)"}
          onBlur={e => e.target.style.borderColor="var(--border)"} />
      </div>
    </header>
  );
}

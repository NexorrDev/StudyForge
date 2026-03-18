"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  onMenuClick: () => void;
  isMobile: boolean;
  sidebarWidth: number;
}

export function TopBar({ onMenuClick, isMobile, sidebarWidth }: Props) {
  const [q, setQ] = useState("");
  const router    = useRouter();

  return (
    <header style={{
      position:"fixed", top:0, right:0,
      left: isMobile ? 0 : sidebarWidth,
      zIndex: 40,
      display:"flex", alignItems:"center", gap:12, padding:"0 16px",
      height: 60,
      background:"rgba(6,6,12,0.85)", backdropFilter:"blur(20px)",
      borderBottom:"1px solid var(--border)",
      transition:"left 0.3s ease",
    }}>
      {/* Hamburger — mobile only */}
      {isMobile && (
        <button onClick={onMenuClick} style={{
          width:36, height:36, borderRadius:10, border:"1px solid var(--border)",
          background:"transparent", color:"var(--text-secondary)", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, flexShrink:0, transition:"all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="var(--text-primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-secondary)"; }}>
          ☰
        </button>
      )}

      {/* Search */}
      <div style={{ flex:1, maxWidth:400, position:"relative" }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none", fontSize:14 }}>🔍</span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && q.trim()) { router.push(`/notes?q=${encodeURIComponent(q)}`); setQ(""); }}}
          placeholder={isMobile ? "Rechercher..." : "Recherche globale... (Entrée)"}
          style={{
            width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10,
            color:"var(--text-primary)", fontSize:13, outline:"none", padding:"8px 14px 8px 36px",
            fontFamily:"var(--font-dm-sans,sans-serif)", transition:"border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor="var(--border-bright)"}
          onBlur={e  => e.target.style.borderColor="var(--border)"}
        />
      </div>
    </header>
  );
}

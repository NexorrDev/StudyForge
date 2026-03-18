"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const NAV = [
  { href:"/dashboard",  icon:"🏠", label:"Dashboard" },
  { href:"/flashcards", icon:"🃏", label:"Flashcards" },
  { href:"/notes",      icon:"📖", label:"Fiches" },
  { href:"/stats",      icon:"📊", label:"Statistiques" },
  { href:"/explore",    icon:"🌍", label:"Explorer" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  width: number;
}

export function Sidebar({ open, onClose, isMobile, width }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name     = session?.user?.name || session?.user?.email || "Utilisateur";
  const initials = name.slice(0, 2).toUpperCase();

  const translateX = isMobile ? (open ? "0" : `-${width}px`) : "0";

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0,
      width: width, height: "100vh",
      background: "var(--bg-deep)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      padding: 16, zIndex: 50,
      transform: `translateX(${translateX})`,
      transition: "transform 0.3s ease",
      overflowY: "auto",
    }}>
      {/* Logo + close button */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <Link href="/dashboard" onClick={onClose} style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", minWidth:0 }}>
          <div style={{ width:34, height:34, borderRadius:10, flexShrink:0,
            background:"linear-gradient(135deg,var(--primary),var(--cyan))",
            boxShadow:"0 4px 16px var(--primary-glow)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>
            🧠
          </div>
          <span style={{
            fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:17,
            color:"var(--text-primary)", whiteSpace:"nowrap",
          }}>
            StudyForge
          </span>
        </Link>

        {/* Close button — mobile only */}
        {isMobile && (
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:8, border:"1px solid var(--border)",
            background:"transparent", color:"var(--text-secondary)", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, flexShrink:0,
          }}>✕</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
        {NAV.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onClose} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:12,
              background: active ? "rgba(124,58,237,0.2)" : "transparent",
              border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
              color: active ? "var(--primary-light)" : "var(--text-secondary)",
              textDecoration:"none", transition:"all 0.2s",
              fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, fontSize:14,
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="var(--text-primary)"; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-secondary)"; }}}>
              <span style={{ fontSize:17, flexShrink:0 }}>{item.icon}</span>
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ borderTop:"1px solid var(--border)", paddingTop:12, marginTop:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:12, marginBottom:8, minWidth:0 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0,
            background:"linear-gradient(135deg,var(--primary),var(--cyan))",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13, color:"white" }}>
            {initials}
          </div>
          <div style={{ overflow:"hidden", minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</p>
            <p style={{ fontSize:10, color:"var(--text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{session?.user?.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl:"/auth/login" })}
          style={{ width:"100%", padding:"8px 12px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text-secondary)", cursor:"pointer", fontSize:12, fontFamily:"var(--font-syne,sans-serif)", fontWeight:600, textAlign:"left", transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(244,63,94,0.08)"; e.currentTarget.style.color="var(--rose)"; e.currentTarget.style.borderColor="rgba(244,63,94,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-secondary)"; e.currentTarget.style.borderColor="var(--border)"; }}>
          🚪 Se déconnecter
        </button>
      </div>
    </aside>
  );
}

interface Props { days: number; record?: number; }

export function StreakBadge({ days, record }: Props) {
  const best = record ?? days;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:16, borderRadius:16,
      background:"linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))",
      border:"1px solid rgba(245,158,11,0.3)" }}>
      <span style={{ fontSize:36, animation:"streakFlame 1.5s ease-in-out infinite", display:"inline-block", flexShrink:0 }}>🔥</span>
      <div style={{ minWidth:0 }}>
        <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:24, color:"var(--amber)", lineHeight:1 }}>{days} jour{days !== 1 ? "s" : ""}</p>
        <p style={{ color:"var(--text-secondary)", fontSize:12, marginTop:4 }}>
          {days === 0 ? "Commence ta série aujourd'hui !" : "Série en cours · Continue comme ça !"}
        </p>
      </div>
      <div style={{ marginLeft:"auto", textAlign:"right", flexShrink:0 }}>
        <p style={{ fontSize:11, color:"var(--text-secondary)" }}>Record</p>
        <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:18, color:"var(--amber)" }}>{best} 🏆</p>
      </div>
    </div>
  );
}

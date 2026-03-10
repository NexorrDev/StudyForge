export function AmbientBackground() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      <div style={{ position:"absolute", width:600, height:600, top:-200, left:-100, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
        animation:"orbDrift 20s ease-in-out infinite" }} />
      <div style={{ position:"absolute", width:500, height:500, bottom:-150, right:-100, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(6,214,232,0.08) 0%, transparent 70%)",
        animation:"orbDrift 25s ease-in-out infinite reverse" }} />
      <div style={{ position:"absolute", width:300, height:300, top:"40%", left:"60%", borderRadius:"50%",
        background:"radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        animation:"orbDrift 18s ease-in-out infinite" }} />
      <div style={{ position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(120,100,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(120,100,255,0.03) 1px, transparent 1px)",
        backgroundSize:"40px 40px" }} />
    </div>
  );
}

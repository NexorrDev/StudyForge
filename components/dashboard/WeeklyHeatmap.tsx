"use client";
interface Day { day: string; cards: number; }

export function WeeklyHeatmap({ data }: { data?: Day[] }) {
  const days = data || [
    { day:"Lun", cards:0 },{ day:"Mar", cards:0 },{ day:"Mer", cards:0 },
    { day:"Jeu", cards:0 },{ day:"Ven", cards:0 },{ day:"Sam", cards:0 },{ day:"Dim", cards:0 },
  ];
  const max = Math.max(...days.map(d => d.cards), 1);
  return (
    <div>
      <div style={{ display:"flex", gap:6 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <div title={`${d.cards} cartes`} style={{ width:"100%", height:36, borderRadius:8, cursor:"pointer", transition:"all 0.2s",
              background:`rgba(124,58,237,${Math.max(0.05, (d.cards/max)*0.8)})`,
              border:d.cards===max&&d.cards>0?"1px solid var(--primary)":"1px solid transparent" }}
              onMouseEnter={e => { e.currentTarget.style.transform="scaleY(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scaleY(1)"; }} />
            <span style={{ fontSize:10, color:"var(--text-secondary)" }}>{d.day}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize:11, marginTop:10, textAlign:"center", color:"var(--text-muted)" }}>
        {days.reduce((a,d) => a+d.cards, 0)} cartes cette semaine
      </p>
    </div>
  );
}

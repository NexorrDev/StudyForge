"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ padding:"8px 12px", borderRadius:10, background:"var(--bg-card)", border:"1px solid var(--border-bright)" }}>
      <p style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, marginBottom:4, color:"var(--text-primary)" }}>{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ fontSize:13, color:p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

const DEFAULT = [
  { day:"Lun", cards:0, minutes:0 },{ day:"Mar", cards:0, minutes:0 },
  { day:"Mer", cards:0, minutes:0 },{ day:"Jeu", cards:0, minutes:0 },
  { day:"Ven", cards:0, minutes:0 },{ day:"Sam", cards:0, minutes:0 },
  { day:"Dim", cards:0, minutes:0 },
];

export function StatsCharts({ weeklyActivity }: { weeklyActivity?: any[] }) {
  const data = weeklyActivity || DEFAULT;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ padding:24, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
        <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:15, marginBottom:24, color:"var(--text-primary)" }}>Cartes révisées (7 derniers jours)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,100,255,0.08)" />
            <XAxis dataKey="day" tick={{ fill:"var(--text-secondary)", fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"var(--text-secondary)", fontSize:12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} />
            <Bar dataKey="cards" name="Cartes" fill="var(--primary)" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ padding:24, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
        <h3 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:15, marginBottom:24, color:"var(--text-primary)" }}>Temps d'étude (minutes)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} />
            <Area type="monotone" dataKey="minutes" name="Minutes" stroke="var(--cyan)" fill="url(#tg)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

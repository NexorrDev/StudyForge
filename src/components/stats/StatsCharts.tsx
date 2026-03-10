"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const MONTHLY = [
  { month:"Sep", cards:45, time:120 }, { month:"Oct", cards:72, time:200 },
  { month:"Nov", cards:58, time:160 }, { month:"Dec", cards:90, time:260 },
  { month:"Jan", cards:65, time:180 }, { month:"Fev", cards:88, time:240 },
];

const SUBJECTS = [
  { name:"Physique", score:82, color:"#7C3AED" }, { name:"Maths", score:75, color:"#06D6E8" },
  { name:"Chimie", score:91, color:"#10B981" }, { name:"Histoire", score:63, color:"#F59E0B" },
];

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ padding:"8px 12px", borderRadius:10, background:"var(--bg-card)", border:"1px solid var(--border-bright)" }}>
      <p style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, marginBottom:4, color:"var(--text-primary)" }}>{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ fontSize:13, color:p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export function StatsCharts() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ padding:24, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
        <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:15, marginBottom:24, color:"var(--text-primary)" }}>Cartes revisees par mois</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MONTHLY} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,100,255,0.08)" />
            <XAxis dataKey="month" tick={{ fill:"var(--text-secondary)", fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"var(--text-secondary)", fontSize:12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} />
            <Bar dataKey="cards" name="Cartes" fill="var(--primary)" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div style={{ padding:24, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:15, marginBottom:24, color:"var(--text-primary)" }}>Temps d'etude (min)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Area type="monotone" dataKey="time" name="Minutes" stroke="var(--cyan)" fill="url(#tg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ padding:24, borderRadius:16, background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <h3 style={{ fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, fontSize:15, marginBottom:24, color:"var(--text-primary)" }}>Performance par matiere</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {SUBJECTS.map(s => (
              <div key={s.name}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{s.name}</span>
                  <span style={{ fontSize:13, fontFamily:"var(--font-syne, Syne), sans-serif", fontWeight:700, color:s.color }}>{s.score}%</span>
                </div>
                <div style={{ height:6, borderRadius:3, overflow:"hidden", background:"rgba(255,255,255,0.05)" }}>
                  <div style={{ height:"100%", width:`${s.score}%`, background:s.color, borderRadius:3, transition:"width 1s ease 0.3s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

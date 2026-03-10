interface BadgeProps {
  color?: "violet" | "cyan" | "amber" | "emerald" | "rose";
  children: React.ReactNode;
}

const colorMap: Record<string, React.CSSProperties> = {
  violet: { background: "rgba(124,58,237,0.2)", color: "var(--primary-light)", border: "1px solid rgba(124,58,237,0.3)" },
  cyan: { background: "rgba(6,214,232,0.15)", color: "var(--cyan)", border: "1px solid rgba(6,214,232,0.25)" },
  amber: { background: "rgba(245,158,11,0.15)", color: "var(--amber)", border: "1px solid rgba(245,158,11,0.25)" },
  emerald: { background: "rgba(16,185,129,0.15)", color: "var(--emerald)", border: "1px solid rgba(16,185,129,0.3)" },
  rose: { background: "rgba(244,63,94,0.15)", color: "var(--rose)", border: "1px solid rgba(244,63,94,0.3)" },
};

export function Badge({ color = "violet", children }: BadgeProps) {
  return (
    <span style={{ ...colorMap[color], display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20, fontSize: 11,
      fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 600, letterSpacing: "0.05em" }}>
      {children}
    </span>
  );
}

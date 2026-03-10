"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, label, style, ...props }, ref) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 11, fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>{icon}</div>}
        <input
          ref={ref}
          style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12,
            color: "var(--text-primary)", fontFamily: "var(--font-dm-sans, DM Sans), sans-serif", fontSize: 14, outline: "none",
            padding: icon ? "12px 16px 12px 42px" : "12px 16px", transition: "border-color 0.2s", ...style }}
          onFocus={e => { e.target.style.borderColor = "var(--border-bright)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; }}
          {...props}
        />
      </div>
    </div>
  )
);
Input.displayName = "Input";

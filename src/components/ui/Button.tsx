"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const styles: Record<string, React.CSSProperties> = {
      primary: { background: "linear-gradient(135deg, var(--primary), var(--primary-light))", color: "white", boxShadow: "0 4px 20px var(--primary-glow)", border: "none" },
      ghost: { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" },
      danger: { background: "rgba(244,63,94,0.15)", color: "var(--rose)", border: "1px solid rgba(244,63,94,0.3)" },
      success: { background: "rgba(16,185,129,0.15)", color: "var(--emerald)", border: "1px solid rgba(16,185,129,0.3)" },
    };
    const pads: Record<string, string> = { sm: "6px 12px", md: "10px 20px", lg: "12px 28px" };
    const fSizes: Record<string, string> = { sm: "12px", md: "14px", lg: "16px" };

    return (
      <button
        ref={ref}
        style={{ ...styles[variant], padding: pads[size], fontSize: fSizes[size],
          fontFamily: "var(--font-syne, Syne), sans-serif", fontWeight: 600,
          borderRadius: 12, cursor: "pointer", display: "inline-flex", alignItems: "center",
          gap: 8, transition: "all 0.2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/dashboard");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    background: "var(--bg-card)", border: "1px solid var(--border)",
    color: "var(--text-primary)", fontSize: 14, outline: "none",
    fontFamily: "var(--font-dm-sans, sans-serif)", transition: "border-color 0.2s",
  };

  return (
    <>
      <AmbientBackground />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 20px var(--primary-glow)" }}>🧠</div>
              <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)" }}>StudyForge</span>
            </Link>
            <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", marginBottom: 8 }}>Content de te revoir !</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Connecte-toi pour continuer ta progression</p>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "var(--rose)", fontSize: 13 }}>
                  {error}
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, fontFamily: "var(--font-syne, sans-serif)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ton@email.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-bright)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, fontFamily: "var(--font-syne, sans-serif)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-bright)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              </div>
              <button type="submit" disabled={loading} style={{
                marginTop: 8, padding: "13px 0", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))", color: "white",
                fontFamily: "var(--font-syne, sans-serif)", fontWeight: 700, fontSize: 15,
                boxShadow: "0 4px 20px var(--primary-glow)", opacity: loading ? 0.7 : 1, transition: "all 0.2s",
              }}>
                {loading ? "Connexion..." : "Se connecter →"}
              </button>
            </form>
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-secondary)" }}>
              Pas encore de compte ?{" "}
              <Link href="/auth/register" style={{ color: "var(--primary-light)", fontWeight: 600, textDecoration: "none" }}>Creer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setOpen(false); // reset on desktop
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarWidth = 240;

  return (
    <div style={{ minHeight:"100vh" }}>
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div onClick={() => setOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:49, backdropFilter:"blur(4px)" }} />
      )}

      <Sidebar
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        isMobile={isMobile}
        width={sidebarWidth}
      />

      <TopBar
        onMenuClick={() => setOpen(o => !o)}
        isMobile={isMobile}
        sidebarWidth={sidebarWidth}
      />

      <main style={{
        marginLeft: isMobile ? 0 : sidebarWidth,
        paddingTop: 60,
        transition: "margin-left 0.3s ease",
      }}>
        <div style={{ padding: isMobile ? "20px 16px" : "32px", maxWidth: 1200 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

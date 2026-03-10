import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar />
      <TopBar />
      <main style={{ marginLeft: 220, paddingTop: 64 }}>
        <div style={{ padding: 32, maxWidth: 1200 }}>{children}</div>
      </main>
    </div>
  );
}

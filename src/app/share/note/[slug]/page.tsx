import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import Link from "next/link";

export default async function SharedNotePage({ params }: { params: { slug: string } }) {
  const note = await prisma.note.findUnique({
    where: { shareSlug: params.slug },
    include: { user: { select: { name: true } } },
  });

  if (!note || !note.isPublic) notFound();

  const isHtml = note.content.trim().startsWith("<!DOCTYPE") || note.content.trim().startsWith("<html");

  return (
    <>
      <AmbientBackground />
      <div style={{ minHeight:"100vh", position:"relative", zIndex:1 }}>
        {/* Banner */}
        <div style={{ padding:"12px 24px", background:"rgba(124,58,237,0.15)", borderBottom:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
              <span style={{ fontSize:20 }}>🧠</span>
              <span style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:15, color:"var(--text-primary)" }}>StudyForge</span>
            </Link>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>·</span>
            <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Fiche partagée par <strong style={{ color:"var(--text-primary)" }}>{note.user?.name || "un utilisateur"}</strong></span>
          </div>
          <Link href="/auth/register" style={{ padding:"7px 16px", borderRadius:10, background:"var(--primary)", color:"white", textDecoration:"none", fontFamily:"var(--font-syne,sans-serif)", fontWeight:700, fontSize:13 }}>
            Créer mon compte →
          </Link>
        </div>

        {isHtml ? (
          <iframe srcDoc={note.content} style={{ width:"100%", height:"calc(100vh - 52px)", border:"none", display:"block" }} sandbox="allow-scripts" />
        ) : (
          <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px" }}>
            <h1 style={{ fontFamily:"var(--font-syne,sans-serif)", fontWeight:800, fontSize:28, color:"var(--text-primary)", marginBottom:24 }}>{note.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: note.content }} style={{ lineHeight:1.8, fontSize:15, color:"var(--text-primary)" }} />
          </div>
        )}
      </div>
    </>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  const { title, content, subject, tags } = await req.json();
  if (!title) return NextResponse.json({ error: "Titre requis" }, { status: 400 });

  const note = await prisma.note.create({
    data: { title, content: content || "", subject: subject || null, tags: tags || [], userId },
  });
  return NextResponse.json(note, { status: 201 });
}

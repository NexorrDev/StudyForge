import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  const note = await prisma.note.findFirst({ where: { id: params.id, userId } });
  if (!note) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(note);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const note = await prisma.note.updateMany({
    where: { id: params.id, userId },
    data: { title: body.title, content: body.content, subject: body.subject, tags: body.tags || [] },
  });
  return NextResponse.json(note);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  await prisma.note.deleteMany({ where: { id: params.id, userId } });
  return NextResponse.json({ success: true });
}

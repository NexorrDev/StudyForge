import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function randomSlug() {
  return Math.random().toString(36).substring(2, 10);
}

// POST — enable sharing
export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as any).id;

  const note = await prisma.note.findFirst({ where: { id: params.id, userId } });
  if (!note) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (note.shareSlug) return NextResponse.json({ shareSlug: note.shareSlug });

  let shareSlug = randomSlug();
  // Ensure unique
  while (await prisma.note.findUnique({ where: { shareSlug } })) {
    shareSlug = randomSlug();
  }

  await prisma.note.update({ where: { id: params.id }, data: { shareSlug, isPublic: true } });
  return NextResponse.json({ shareSlug });
}

// DELETE — disable sharing
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as any).id;

  await prisma.note.updateMany({
    where: { id: params.id, userId },
    data: { shareSlug: null, isPublic: false },
  });
  return NextResponse.json({ success: true });
}

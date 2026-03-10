import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  const deck = await prisma.deck.findFirst({
    where: { id: params.id, userId },
    include: { flashcards: { include: { reviews: { where: { userId } } } } },
  });
  if (!deck) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(deck);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  await prisma.deck.updateMany({ where: { id: params.id, userId }, data: body });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  await prisma.deck.deleteMany({ where: { id: params.id, userId } });
  return NextResponse.json({ success: true });
}

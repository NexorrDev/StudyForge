import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;

  const deck = await prisma.deck.findFirst({ where: { id: params.id, userId } });
  if (!deck) return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });

  const body = await req.json();
  const cards = Array.isArray(body) ? body : [body];

  const created = await prisma.flashcard.createMany({
    data: cards.map((c: any) => ({ front: c.front, back: c.back, deckId: params.id })),
  });
  return NextResponse.json({ count: created.count }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  const { cardId } = await req.json();

  const deck = await prisma.deck.findFirst({ where: { id: params.id, userId } });
  if (!deck) return NextResponse.json({ error: "Non autorise" }, { status: 403 });

  await prisma.flashcard.delete({ where: { id: cardId } });
  return NextResponse.json({ success: true });
}

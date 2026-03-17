import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { cardId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as any).id;

  const { front, back } = await req.json();
  if (!front?.trim() || !back?.trim())
    return NextResponse.json({ error: "Recto et verso requis" }, { status: 400 });

  // Verify ownership via deck
  const card = await prisma.flashcard.findFirst({
    where: { id: params.cardId },
    include: { deck: { select: { userId: true } } },
  });
  if (!card || card.deck.userId !== userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.flashcard.update({
    where: { id: params.cardId },
    data: { front: front.trim(), back: back.trim() },
  });
  return NextResponse.json(updated);
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;

  const decks = await prisma.deck.findMany({
    where: { userId },
    include: {
      _count: { select: { flashcards: true } },
      flashcards: {
        include: {
          reviews: { where: { userId }, select: { nextReview: true, lastRating: true } }
        }
      }
    },
    orderBy: { updatedAt: "desc" },
  });

  const now = new Date();
  const result = decks.map(deck => {
    const total = deck._count.flashcards;
    const due = deck.flashcards.filter(f => {
      const rev = f.reviews[0];
      return !rev || rev.nextReview <= now;
    }).length;
    const learned = deck.flashcards.filter(f => f.reviews[0]?.lastRating !== undefined && f.reviews[0]?.lastRating >= 2).length;
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0;
    return { id: deck.id, title: deck.title, subject: deck.subject, color: deck.color, tags: deck.tags, total, due, progress, updatedAt: deck.updatedAt };
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;
  const { title, subject, color, tags, description } = await req.json();
  if (!title) return NextResponse.json({ error: "Titre requis" }, { status: 400 });

  const deck = await prisma.deck.create({
    data: { title, subject: subject || null, color: color || "#7C3AED", tags: tags || [], description: description || null, userId },
  });
  return NextResponse.json(deck, { status: 201 });
}

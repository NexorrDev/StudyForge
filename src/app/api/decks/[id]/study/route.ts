import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview } from "@/lib/sm2";
import type { Rating } from "@/lib/sm2";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const userId = (session.user as any).id;

  const { results, duration } = await req.json();
  // results: [{ flashcardId, rating }]

  let xpGained = 0;
  let known = 0;

  for (const { flashcardId, rating } of results) {
    const existing = await prisma.flashcardReview.findUnique({ where: { flashcardId_userId: { flashcardId, userId } } });
    const current = existing || { easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: new Date() };
    const next = calculateNextReview({ ...current, nextReview: new Date(current.nextReview) }, rating as Rating);

    await prisma.flashcardReview.upsert({
      where: { flashcardId_userId: { flashcardId, userId } },
      create: { flashcardId, userId, ...next },
      update: { ...next, lastRating: rating },
    });

    xpGained += [0, 5, 10, 15][rating] || 0;
    if (rating >= 2) known++;
  }

  await prisma.studySession.create({
    data: { userId, deckId: params.id, cardsStudied: results.length, cardsKnown: known, duration: duration || 0, xpGained },
  });

  // Update user XP and streak
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const today = new Date().toDateString();
    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = lastStudy === today ? user.streak : lastStudy === yesterday ? user.streak + 1 : 1;
    const newXP = user.xp + xpGained;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXP, level: newLevel, streak: newStreak, lastStudyDate: new Date() },
    });
  }

  return NextResponse.json({ xpGained, known, total: results.length });
}

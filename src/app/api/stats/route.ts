import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  const totalCards = await prisma.flashcardReview.count({
    where: { userId }
  });

  const notesCount = await prisma.note.count({
    where: { userId }
  });

  const decksCount = await prisma.deck.count({
    where: { userId }
  });

  const now = new Date();

  const dueCards = await prisma.flashcardReview.count({
    where: {
      userId,
      nextReview: { lte: now }
    }
  });

  // Study sessions last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const totalStudyTime = sessions.reduce((a, s) => a + s.duration, 0);
  const totalKnown = sessions.reduce((a, s) => a + s.cardsKnown, 0);
  const totalStudied = sessions.reduce((a, s) => a + s.cardsStudied, 0);

  const successRate =
    totalStudied > 0
      ? Math.round((totalKnown / totalStudied) * 100)
      : 0;

  // Weekly activity (last 7 days)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000);
    const dayStr = date.toDateString();

    const daySessions = sessions.filter(
      s => new Date(s.createdAt).toDateString() === dayStr
    );

    return {
      day: ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][date.getDay()],
      cards: daySessions.reduce((a, s) => a + s.cardsStudied, 0),
      minutes: Math.round(
        daySessions.reduce((a, s) => a + s.duration, 0) / 60
      )
    };
  });

  return NextResponse.json({
    user: {
      name: user?.name,
      xp: user?.xp || 0,
      level: user?.level || 1,
      streak: user?.streak || 0
    },
    stats: {
      totalCards,
      notesCount,
      decksCount,
      dueCards,
      totalStudyTime: Math.round(totalStudyTime / 3600),
      successRate
    },
    weeklyActivity,
    sessions
  });
}

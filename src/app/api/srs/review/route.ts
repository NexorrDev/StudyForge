import { NextRequest, NextResponse } from "next/server";
import { calculateNextReview } from "@/lib/sm2";
import type { Rating } from "@/lib/sm2";

export async function POST(request: NextRequest) {
  const { flashcardId, rating, currentData } = await request.json();
  if (flashcardId === undefined || rating === undefined)
    return NextResponse.json({ error: "flashcardId and rating are required" }, { status: 400 });

  const srsData = currentData || { easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: new Date() };
  const updated = calculateNextReview({ ...srsData, nextReview: new Date(srsData.nextReview) }, rating as Rating);
  return NextResponse.json({ flashcardId, srsData: updated, nextReviewFormatted: updated.nextReview.toLocaleDateString("fr-FR") });
}

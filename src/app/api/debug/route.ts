import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;

    // Try to count users - will fail if table doesn't exist
    try {
      const count = await prisma.user.count();
      return NextResponse.json({ status: "OK", user_count: count });
    } catch (e: any) {
      return NextResponse.json({ status: "TABLES_MISSING", error: e.message });
    }
  } catch (e: any) {
    return NextResponse.json({ status: "DB_CONNECTION_ERROR", error: e.message });
  }
}

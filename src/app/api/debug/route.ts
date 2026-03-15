import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, any> = {};

  // 1. Check env vars (without exposing values)
  checks.DATABASE_URL = !!process.env.DATABASE_URL;
  checks.NEXTAUTH_SECRET = !!process.env.NEXTAUTH_SECRET;
  checks.DATABASE_URL_prefix = process.env.DATABASE_URL?.substring(0, 20) + "...";

  // 2. Try prisma connection
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    checks.db_connection = "OK";

    // 3. Check if User table exists
    const count = await prisma.user.count();
    checks.user_table = "OK";
    checks.user_count = count;
  } catch (e: any) {
    checks.db_error = e.message;
  }

  // 4. Check bcryptjs
  try {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("test", 4);
    checks.bcryptjs = "OK";
  } catch (e: any) {
    checks.bcrypt_error = e.message;
  }

  return NextResponse.json(checks);
}

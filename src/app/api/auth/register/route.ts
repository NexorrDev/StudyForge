import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Email et mot de passe requis (min. 8 caractères)" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // Dynamic import to avoid edge runtime issues
    const bcrypt = await import("bcryptjs");
    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name: name || null, email, password: hashed },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[register] error:", error);
    return NextResponse.json({ error: "Erreur serveur, réessaie." }, { status: 500 });
  }
}

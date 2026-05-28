import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  let body: { token: string; uid?: string; password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { token, uid, password } = body;
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required." }, { status: 422 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 422 });
  }

  // Find user with valid (non-expired) reset token
  const users = uid
    ? await prisma.user.findMany({ where: { id: uid, resetToken: { not: null } } })
    : await prisma.user.findMany({ where: { resetToken: { not: null }, resetTokenExpiresAt: { gt: new Date() } } });

  let matchedUser: typeof users[number] | undefined = undefined;
  for (const user of users) {
    if (!user.resetToken || !user.resetTokenExpiresAt) continue;
    if (user.resetTokenExpiresAt < new Date()) continue;
    const valid = await bcrypt.compare(token, user.resetToken);
    if (valid) { matchedUser = user; break; }
  }

  if (matchedUser === undefined) {
    return NextResponse.json({ error: "Invalid or expired reset link. Please request a new one." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: matchedUser.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ success: true });
}

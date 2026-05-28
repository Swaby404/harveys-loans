import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkPasswordResetRateLimit } from "@/lib/rateLimit";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await checkPasswordResetRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait before trying again." }, { status: 429 });
  }

  let body: { email: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const email = body.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 422 });

  // Always return 200 to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true });

  const rawToken = uuidv4();
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: tokenHash,
      resetTokenExpiresAt: expiresAt,
    },
  });

  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${rawToken}&uid=${user.id}`;

  try {
    await sendPasswordResetEmail({
      toEmail: email,
      firstName: user.firstName,
      resetLink,
    });
  } catch (e) {
    console.error("Password reset email failed:", e);
  }

  return NextResponse.json({ success: true });
}

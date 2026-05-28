import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/authSchemas";
import { checkRegisterRateLimit } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const allowed = await checkRegisterRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    // Support both Zod v3 (.errors) and Zod v4 (.issues)
    const err = parsed.error as { issues?: { message: string }[]; errors?: { message: string }[] };
    const firstMessage = (err.issues ?? err.errors ?? [])[0]?.message ?? "Validation error";
    return NextResponse.json({ error: firstMessage }, { status: 422 });
  }

  const { firstName, lastName, email, phone, password } = parsed.data;

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      email: normalizedEmail,
      phone: phone && phone.trim() !== "" ? sanitizeString(phone.trim()) : null,
      passwordHash,
      role: "CLIENT",
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}

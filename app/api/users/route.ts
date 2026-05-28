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
    // Zod v3 uses .errors, Zod v4 uses .issues
    const issues = (parsed.error as { issues?: { message: string }[]; errors?: { message: string }[] }).issues
      ?? (parsed.error as { errors?: { message: string }[] }).errors
      ?? [];
    return NextResponse.json({ error: issues[0]?.message ?? "Validation error" }, { status: 422 });
  }

  const { firstName, lastName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      email: email.toLowerCase().trim(),
      phone: phone ? sanitizeString(phone) : null,
      passwordHash,
      role: "CLIENT",
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}

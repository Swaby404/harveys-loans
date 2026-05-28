import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendLoanDenialEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { denialReason?: string; adminNotes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  if (loan.status !== "PENDING") {
    return NextResponse.json({ error: "Loan is not pending." }, { status: 400 });
  }

  await prisma.loan.update({
    where: { id },
    data: {
      status: "DENIED",
      denialReason: body.denialReason ?? null,
      adminNotes: body.adminNotes ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "LOAN_DENIED",
      entityType: "Loan",
      entityId: id,
      metadata: { denialReason: body.denialReason },
    },
  });

  try {
    await sendLoanDenialEmail({
      toEmail: loan.user.email,
      firstName: loan.user.firstName,
      lastName: loan.user.lastName,
      denialReason: body.denialReason,
    });
  } catch (e) {
    console.error("Denial email failed:", e);
  }

  return NextResponse.json({ success: true, message: "Application denied and notification sent." });
}

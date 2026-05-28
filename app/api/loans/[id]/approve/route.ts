import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendLoanApprovalEmail } from "@/lib/email";
import { addWeeks } from "@/lib/utils";
import { PROCESSING_FEE } from "@/lib/interest";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { approvedAmount?: number; adminNotes?: string };
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

  const approvedAmount = body.approvedAmount ?? Number(loan.requestedAmount);
  const dueDate = addWeeks(new Date(), 4); // 4 weeks repayment window
  const principal = approvedAmount - PROCESSING_FEE;

  await prisma.loan.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAmount,
      principalAmount: principal,
      outstandingBalance: approvedAmount,
      dueDate,
      approvedAt: new Date(),
      approvedBy: session.user.id,
      adminNotes: body.adminNotes ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "LOAN_APPROVED",
      entityType: "Loan",
      entityId: id,
      metadata: { approvedAmount, adminNotes: body.adminNotes },
    },
  });

  try {
    await sendLoanApprovalEmail({
      toEmail: loan.user.email,
      firstName: loan.user.firstName,
      lastName: loan.user.lastName,
      loanId: loan.id,
      approvedAmount,
      dueDate: dueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      processingFee: PROCESSING_FEE,
    });
  } catch (e) {
    console.error("Approval email failed:", e);
  }

  return NextResponse.json({ success: true, message: "Loan approved and notification sent." });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
  });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Clients can only see their own loans
  if (session.user.role !== "ADMIN" && loan.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: loan.id,
    status: loan.status,
    requestedAmount: loan.requestedAmount.toString(),
    approvedAmount: loan.approvedAmount?.toString() ?? null,
    jobTitle: loan.jobTitle,
    jobSalary: loan.jobSalary,
    processingFee: loan.processingFee.toString(),
    jobLetterFileName: loan.jobLetterFileName,
    paystubFileName: loan.paystubFileName,
    adminNotes: loan.adminNotes,
    denialReason: loan.denialReason,
    missedWeeks: loan.missedWeeks,
    outstandingBalance: loan.outstandingBalance?.toString() ?? null,
    dueDate: loan.dueDate?.toISOString() ?? null,
    createdAt: loan.createdAt.toISOString(),
    user: loan.user,
  });
}

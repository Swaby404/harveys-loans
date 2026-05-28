import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const loan = await prisma.loan.findFirst({
    where: { userId: session.user.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  if (!loan) return NextResponse.json({ error: "No active loan" }, { status: 404 });

  return NextResponse.json({
    id: loan.id,
    outstandingBalance: loan.outstandingBalance?.toString() ?? null,
    requestedAmount: loan.requestedAmount.toString(),
    status: loan.status,
    dueDate: loan.dueDate?.toISOString() ?? null,
    missedWeeks: loan.missedWeeks,
  });
}

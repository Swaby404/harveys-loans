import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalClients, pendingApps, activeLoans, overdueLoans, totalPaid] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.loan.count({ where: { status: "PENDING" } }),
    prisma.loan.count({ where: { status: "APPROVED" } }),
    prisma.loan.count({ where: { status: "APPROVED", missedWeeks: { gt: 0 } } }),
    prisma.payment.aggregate({ _sum: { amountPaid: true } }),
  ]);

  return NextResponse.json({
    totalClients,
    pendingApps,
    activeLoans,
    overdueLoans,
    totalCollected: Number(totalPaid._sum.amountPaid ?? 0),
  });
}

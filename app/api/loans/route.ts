import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/utils";
import { sendAdminNewApplicationEmail } from "@/lib/email";
import { notifyAdminNewApplication } from "@/lib/web3forms";
import { PROCESSING_FEE } from "@/lib/interest";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const {
    jobTitle,
    jobSalary,
    requestedAmount,
    disclaimerAccepted,
    jobLetterFileKey,
    paystubFileKey,
    jobLetterFileName,
    paystubFileName,
  } = body as {
    jobTitle: string;
    jobSalary: string;
    requestedAmount: number;
    disclaimerAccepted: boolean;
    jobLetterFileKey?: string;
    paystubFileKey?: string;
    jobLetterFileName?: string;
    paystubFileName?: string;
  };

  if (!disclaimerAccepted) {
    return NextResponse.json({ error: "Disclaimer must be accepted." }, { status: 422 });
  }

  if (!jobTitle || !jobSalary || !requestedAmount) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 422 });
  }

  if (requestedAmount < 50 || requestedAmount > 5000) {
    return NextResponse.json({ error: "Loan amount must be between $50 and $5,000." }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const loan = await prisma.loan.create({
    data: {
      userId: session.user.id,
      jobTitle: sanitizeString(jobTitle),
      jobSalary: sanitizeString(jobSalary),
      requestedAmount,
      processingFee: PROCESSING_FEE,
      disclaimerAcceptedAt: new Date(),
      jobLetterFileKey: jobLetterFileKey ?? null,
      jobLetterFileName: jobLetterFileName ?? null,
      paystubFileKey: paystubFileKey ?? null,
      paystubFileName: paystubFileName ?? null,
    },
  });

  // Notify admin via email (both SMTP and Web3Forms)
  const applicantName = `${user.firstName} ${user.lastName}`;
  try {
    await sendAdminNewApplicationEmail({
      applicantName,
      applicantEmail: user.email,
      requestedAmount,
      jobTitle,
      loanId: loan.id,
    });
  } catch (e) {
    console.error("Admin email failed:", e);
  }
  try {
    await notifyAdminNewApplication({
      applicantName,
      applicantEmail: user.email,
      requestedAmount,
      jobTitle,
      jobSalary,
      loanId: loan.id,
    });
  } catch (e) {
    console.error("Web3Forms notification failed:", e);
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "LOAN_APPLICATION_SUBMITTED",
      entityType: "Loan",
      entityId: loan.id,
      metadata: JSON.stringify({ requestedAmount, jobTitle }),
    },
  });

  return NextResponse.json({ id: loan.id, status: loan.status }, { status: 201 });
}

export async function GET(req: NextRequest) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const loans = await prisma.loan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return NextResponse.json(loans);
}

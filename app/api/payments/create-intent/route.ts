import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { loanId: string; amount: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { loanId, amount } = body;

  if (!loanId || !amount || amount < 1) {
    return NextResponse.json({ error: "Invalid payment amount or loan ID." }, { status: 422 });
  }

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId: session.user.id, status: "APPROVED" },
    include: { user: true },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found or not eligible for payment." }, { status: 404 });
  }

  const balance = Number(loan.outstandingBalance ?? loan.requestedAmount);
  const capped = Math.min(amount, balance);

  if (capped <= 0) {
    return NextResponse.json({ error: "No outstanding balance." }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(capped * 100), // cents
    currency: "usd",
    metadata: {
      loanId: loan.id,
      userId: session.user.id,
      clientName: `${loan.user.firstName} ${loan.user.lastName}`,
      clientEmail: loan.user.email,
    },
    description: `Harvey's Loans – Loan payment by ${loan.user.firstName} ${loan.user.lastName}`,
    receipt_email: loan.user.email,
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, amount: capped });
}

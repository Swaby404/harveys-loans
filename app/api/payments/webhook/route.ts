import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { applyWeeklyInterest } from "@/lib/interest";
import { sendPaymentReceiptEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { loanId, userId } = intent.metadata;

    if (!loanId || !userId) {
      return NextResponse.json({ error: "Missing metadata." }, { status: 400 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { user: true, payments: { select: { id: true } } },
    });

    if (!loan || loan.userId !== userId) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    const amountPaid = intent.amount / 100;
    const currentBalance = Number(loan.outstandingBalance ?? loan.requestedAmount);
    const newBalance = Math.max(0, parseFloat((currentBalance - amountPaid).toFixed(2)));

    const isOnTime = loan.missedWeeks === 0;
    const paymentStatus = isOnTime ? "ON_TIME" : loan.missedWeeks <= 2 ? "LATE" : "MISSED";

    let interestApplied = 0;
    if (loan.missedWeeks > 0) {
      const { interestCharged } = applyWeeklyInterest(currentBalance, loan.missedWeeks);
      interestApplied = interestCharged;
    }

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          loanId: loan.id,
          userId: loan.userId,
          amountPaid,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          dueDate: loan.dueDate ?? new Date(),
          status: paymentStatus,
          weekNumber: (loan.payments?.length ?? 0) + 1,
          interestApplied,
          notes: `Stripe payment ${intent.id}`,
          receiptSent: false,
        },
      }),
      prisma.loan.update({
        where: { id: loan.id },
        data: {
          outstandingBalance: newBalance,
          status: newBalance <= 0 ? "SETTLED" : "APPROVED",
          missedWeeks: newBalance <= 0 ? 0 : loan.missedWeeks,
        },
      }),
    ]);

    // Send receipt email
    try {
      await sendPaymentReceiptEmail({
        toEmail: loan.user.email,
        firstName: loan.user.firstName,
        lastName: loan.user.lastName,
        amountPaid,
        balanceAfter: newBalance,
        paymentDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        loanId: loan.id,
      });
    } catch (emailErr) {
      console.error("Receipt email failed:", emailErr);
    }

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "PAYMENT_RECEIVED",
        entityType: "Loan",
        entityId: loanId,
        metadata: { amount: amountPaid, stripeIntentId: intent.id, newBalance },
      },
    });
  }

  return NextResponse.json({ received: true });
}

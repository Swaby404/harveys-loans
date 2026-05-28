"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { DollarSign, CreditCard, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface LoanInfo {
  id: string;
  outstandingBalance: string | null;
  requestedAmount: string;
  status: string;
  dueDate: string | null;
}

function PaymentForm({ amount, onSuccess }: { loanId?: string; amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/pay/success`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "auto", email: "auto" } },
        }}
      />
      {error && <Alert type="error">{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!stripe} className="w-full py-3.5 text-base">
        <CreditCard size={18} /> Pay ${amount.toFixed(2)} Now
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
        <Shield size={12} /> Secured by Stripe. Your card details are never stored on our servers.
      </div>
    </form>
  );
}

export default function PayPage() {
  const [loan, setLoan] = useState<LoanInfo | null>(null);
  const [loadingLoan, setLoadingLoan] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/loans/active")
      .then((r) => r.json())
      .then((d) => {
        if (d.id) {
          setLoan(d);
          const bal = Number(d.outstandingBalance ?? d.requestedAmount);
          setPaymentAmount(bal.toFixed(2));
        }
      })
      .catch(() => setIntentError("Could not load loan information."))
      .finally(() => setLoadingLoan(false));
  }, []);

  const handleProceed = async () => {
    if (!loan) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setIntentError("Please enter a valid payment amount.");
      return;
    }
    setCreatingIntent(true);
    setIntentError("");
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId: loan.id, amount }),
      });
      const j = await res.json();
      if (!res.ok) {
        setIntentError(j.error || "Failed to initialize payment.");
        return;
      }
      setClientSecret(j.clientSecret);
    } catch {
      setIntentError("An error occurred. Please try again.");
    } finally {
      setCreatingIntent(false);
    }
  };

  if (loadingLoan) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-display font-bold text-navy-800">Payment Successful!</h1>
        <p className="text-gray-500 mt-2">Your payment has been processed. A receipt has been sent to your email.</p>
        <Link href="/dashboard" className="btn-primary mt-8 inline-flex">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!loan || loan.status !== "APPROVED") {
    return (
      <div className="max-w-lg mx-auto">
        <Alert type="info">You do not have an active approved loan to make a payment toward.</Alert>
        <Link href="/dashboard" className="btn-secondary mt-4 inline-flex">← Dashboard</Link>
      </div>
    );
  }

  const balance = Number(loan.outstandingBalance ?? loan.requestedAmount);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-600">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-2xl font-display font-bold text-navy-800">Make a Payment</h1>
      </div>

      {/* Balance summary */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
            <DollarSign size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-500">${balance.toFixed(2)}</p>
          </div>
        </div>
        {loan.dueDate && (
          <p className="text-sm text-gray-500">
            Due: <span className="font-semibold text-navy-700">{new Date(loan.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </p>
        )}
      </Card>

      {!clientSecret ? (
        <Card>
          <h2 className="text-lg font-bold text-navy-700 mb-4">Payment Amount</h2>
          <div>
            <label htmlFor="payment-amount" className="label">Amount to Pay (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-500 font-semibold">$</span>
              <input
                id="payment-amount"
                type="number"
                step="0.01"
                min="1"
                max={balance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="input-field pl-7 text-lg font-bold"
                placeholder="0.00"
                aria-label="Payment amount in USD"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[25, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPaymentAmount(Math.min(v, balance).toFixed(2))}
                  className="px-3 py-1.5 text-xs font-semibold bg-navy-50 text-navy-600 rounded-lg hover:bg-navy-100 transition-colors"
                >
                  ${v}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPaymentAmount(balance.toFixed(2))}
                className="px-3 py-1.5 text-xs font-semibold bg-gold-50 text-gold-600 rounded-lg hover:bg-gold-100 transition-colors"
              >
                Full Balance
              </button>
            </div>
          </div>

          {intentError && <Alert type="error" className="mt-4">{intentError}</Alert>}

          <Button onClick={handleProceed} loading={creatingIntent} className="w-full mt-5 py-3.5">
            <CreditCard size={16} /> Proceed to Payment
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={18} className="text-gold-500" />
            <h2 className="text-lg font-bold text-navy-700">Secure Payment</h2>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#1e3a5f",
                  colorBackground: "#ffffff",
                  fontFamily: "Inter, system-ui, sans-serif",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <PaymentForm
              loanId={loan.id}
              amount={parseFloat(paymentAmount)}
              onSuccess={() => setSuccess(true)}
            />
          </Elements>
        </Card>
      )}
    </div>
  );
}

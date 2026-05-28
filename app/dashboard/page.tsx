import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, loanStatusVariant } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowRight,
  FileText,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { INTEREST_SCHEDULE_DISPLAY } from "@/lib/interest";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      loans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { payments: { orderBy: { paymentDate: "desc" }, take: 5 } },
      },
    },
  });

  const activeLoan = user?.loans?.[0];
  const firstName = user?.firstName ?? "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-800">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s an overview of your account.</p>
      </div>

      {/* No loan yet */}
      {!activeLoan && (
        <Alert type="info">
          You don&apos;t have an active loan application yet.{" "}
          <Link href="/dashboard/apply" className="font-semibold underline">
            Apply for a loan now →
          </Link>
        </Alert>
      )}

      {/* Active loan summary */}
      {activeLoan && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gold-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={22} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-navy-800">
                    {formatCurrency(Number(activeLoan.outstandingBalance ?? activeLoan.requestedAmount))}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-navy-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={22} className="text-navy-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Loan Status</p>
                  <Badge variant={loanStatusVariant(activeLoan.status)} className="mt-1 text-sm px-3 py-1">
                    {activeLoan.status}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar size={22} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Due Date</p>
                  <p className="text-base font-bold text-navy-800">
                    {activeLoan.dueDate ? formatDate(activeLoan.dueDate) : "—"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Loan details card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-700">Current Loan</h2>
              <Link href="/dashboard/loan" className="text-sm text-gold-500 font-medium flex items-center gap-1 hover:text-gold-600">
                View details <ArrowRight size={14} />
              </Link>
            </div>

            {activeLoan.missedWeeks > 0 && (
              <Alert type="warning" className="mb-4">
                You have <strong>{activeLoan.missedWeeks}</strong> missed payment week(s).
                Additional interest is being applied. Please make a payment as soon as possible.
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Requested Amount</p>
                <p className="font-semibold text-navy-700">{formatCurrency(Number(activeLoan.requestedAmount))}</p>
              </div>
              <div>
                <p className="text-gray-400">Processing Fee</p>
                <p className="font-semibold text-red-500">-{formatCurrency(Number(activeLoan.processingFee))}</p>
              </div>
              <div>
                <p className="text-gray-400">Missed Weeks</p>
                <p className={`font-semibold ${activeLoan.missedWeeks > 0 ? "text-red-500" : "text-green-600"}`}>
                  {activeLoan.missedWeeks}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Current Interest Rate</p>
                <p className="font-semibold text-navy-700">
                  {activeLoan.currentInterestRate
                    ? `${(Number(activeLoan.currentInterestRate) * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </Card>

          {/* Recent payments */}
          {activeLoan.payments.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-navy-700">Recent Payments</h2>
                <Link href="/dashboard/payments" className="text-sm text-gold-500 font-medium flex items-center gap-1 hover:text-gold-600">
                  All payments <ArrowRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount Paid</th>
                      <th className="pb-3">Balance After</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLoan.payments.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 text-gray-600">{formatDate(p.paymentDate)}</td>
                        <td className="py-3 font-semibold text-green-600">{formatCurrency(Number(p.amountPaid))}</td>
                        <td className="py-3 font-semibold text-navy-700">{formatCurrency(Number(p.balanceAfter))}</td>
                        <td className="py-3">
                          <Badge variant={p.status === "ON_TIME" ? "approved" : "denied"}>
                            {p.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Interest Rate Info */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-gold-500" />
          <h2 className="text-lg font-bold text-navy-700">Interest Rate Schedule</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {INTEREST_SCHEDULE_DISPLAY.map((r) => (
            <div key={r.week} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">{r.label}</span>
              <span className={`font-bold ${r.color}`}>{r.rate}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <CheckCircle size={12} className="text-green-500" />
          On-time payments incur no interest charges.
        </p>
      </Card>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

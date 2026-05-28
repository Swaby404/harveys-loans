import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, loanStatusVariant } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { INTEREST_SCHEDULE_DISPLAY } from "@/lib/interest";
import { FileText, Shield } from "lucide-react";

export default async function LoanDetailPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const loan = await prisma.loan.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { payments: { orderBy: { paymentDate: "desc" } } },
  });

  if (!loan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-navy-800">My Loan</h1>
        <Alert type="info">
          You don&apos;t have an active loan application yet.{" "}
          <Link href="/dashboard/apply" className="font-semibold underline">Apply now →</Link>
        </Alert>
      </div>
    );
  }

  const balance = Number(loan.outstandingBalance ?? loan.requestedAmount);
  const totalPaid = loan.payments.reduce((s, p) => s + Number(p.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">My Loan</h1>
          <p className="text-gray-500 mt-1 text-xs">Application ID: {loan.id}</p>
        </div>
        <Badge variant={loanStatusVariant(loan.status)} className="text-sm px-3 py-1.5">
          {loan.status}
        </Badge>
      </div>

      {loan.status === "PENDING" && (
        <Alert type="info">
          Your application is currently under review. You will receive an email notification once a decision has been made.
        </Alert>
      )}

      {loan.status === "DENIED" && (
        <Alert type="error">
          Your loan application was not approved.
          {loan.denialReason && <><br />Reason: <strong>{loan.denialReason}</strong></>}
        </Alert>
      )}

      {loan.missedWeeks > 0 && loan.status === "APPROVED" && (
        <Alert type="warning">
          <strong>{loan.missedWeeks} missed payment week(s).</strong> Additional interest has been applied.
          Current interest rate: <strong>{loan.currentInterestRate ? `${(Number(loan.currentInterestRate) * 100).toFixed(0)}%` : "—"}</strong>
        </Alert>
      )}

      {/* Loan Summary */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-4">Loan Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-400">Requested Amount</p><p className="font-bold text-navy-700 text-base">${Number(loan.requestedAmount).toFixed(2)}</p></div>
          <div><p className="text-gray-400">Approved Amount</p><p className="font-bold text-navy-700 text-base">{loan.approvedAmount ? `$${Number(loan.approvedAmount).toFixed(2)}` : "—"}</p></div>
          <div><p className="text-gray-400">Outstanding Balance</p><p className="font-bold text-red-500 text-base">${balance.toFixed(2)}</p></div>
          <div><p className="text-gray-400">Total Paid</p><p className="font-bold text-green-600 text-base">${totalPaid.toFixed(2)}</p></div>
          <div><p className="text-gray-400">Processing Fee</p><p className="font-semibold text-red-500">-${Number(loan.processingFee).toFixed(2)}</p></div>
          <div><p className="text-gray-400">Due Date</p><p className="font-semibold text-navy-700">{loan.dueDate ? formatDate(loan.dueDate) : "—"}</p></div>
          <div><p className="text-gray-400">Application Date</p><p className="font-semibold text-navy-700">{formatDate(loan.createdAt)}</p></div>
          <div><p className="text-gray-400">Approval Date</p><p className="font-semibold text-navy-700">{loan.approvedAt ? formatDate(loan.approvedAt) : "—"}</p></div>
        </div>
      </Card>

      {/* Employment */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-gold-500" /> Employment Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-400">Job Title</p><p className="font-semibold text-navy-700">{loan.jobTitle}</p></div>
          <div><p className="text-gray-400">Annual Salary</p><p className="font-semibold text-navy-700">{loan.jobSalary}</p></div>
          <div><p className="text-gray-400">Job Letter</p><p className={`font-semibold ${loan.jobLetterFileKey ? "text-green-600" : "text-gray-400"}`}>{loan.jobLetterFileName || "Not uploaded"}</p></div>
          <div><p className="text-gray-400">Paystub</p><p className={`font-semibold ${loan.paystubFileKey ? "text-green-600" : "text-gray-400"}`}>{loan.paystubFileName || "Not uploaded"}</p></div>
        </div>
      </Card>

      {/* Interest Rate Schedule */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-gold-500" /> Interest Rate Schedule
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {INTEREST_SCHEDULE_DISPLAY.map((r) => (
            <div
              key={r.week}
              className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                loan.missedWeeks === r.week
                  ? "bg-red-50 border border-red-200"
                  : "bg-gray-50"
              }`}
            >
              <span className="text-gray-600">{r.label}</span>
              <span className={`font-bold ${r.color}`}>{r.rate}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

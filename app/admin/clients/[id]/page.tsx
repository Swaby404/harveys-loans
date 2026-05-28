import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge, loanStatusVariant } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";
import { ArrowLeft, User, DollarSign, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    include: {
      loans: {
        orderBy: { createdAt: "desc" },
        include: { payments: { orderBy: { paymentDate: "desc" } } },
      },
    },
  });

  if (!client) notFound();

  const activeLoan = client.loans.find((l) => l.status === "APPROVED");
  const allPayments = client.loans.flatMap((l) => l.payments);
  const totalPaid = allPayments.reduce((s, p) => s + Number(p.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-600">
          <ArrowLeft size={16} /> Back to Clients
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold text-xl">
          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">{client.firstName} {client.lastName}</h1>
          <p className="text-gray-500">{client.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Loans</p>
          <p className="text-2xl font-bold text-navy-700">{client.loans.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-red-500">
            {activeLoan ? `$${Number(activeLoan.outstandingBalance ?? activeLoan.requestedAmount).toFixed(2)}` : "$0.00"}
          </p>
        </Card>
      </div>

      {/* Client info */}
      <Card>
        <h2 className="text-base font-bold text-navy-700 mb-4 flex items-center gap-2">
          <User size={16} className="text-gold-500" /> Profile
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400">First Name</p><p className="font-semibold text-navy-700">{client.firstName}</p></div>
          <div><p className="text-gray-400">Last Name</p><p className="font-semibold text-navy-700">{client.lastName}</p></div>
          <div><p className="text-gray-400">Email</p><p className="font-semibold text-navy-700">{client.email}</p></div>
          <div><p className="text-gray-400">Phone</p><p className="font-semibold text-navy-700">{client.phone || "—"}</p></div>
          <div><p className="text-gray-400">Member Since</p><p className="font-semibold text-navy-700">{formatDate(client.createdAt)}</p></div>
          <div><p className="text-gray-400">Account Status</p><Badge variant={client.isActive ? "approved" : "denied"}>{client.isActive ? "Active" : "Suspended"}</Badge></div>
        </div>
      </Card>

      {/* Active loan */}
      {activeLoan && (
        <Card>
          <h2 className="text-base font-bold text-navy-700 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-gold-500" /> Active Loan
          </h2>
          {activeLoan.missedWeeks > 0 && (
            <Alert type="warning" className="mb-4">
              <strong>{activeLoan.missedWeeks} missed week(s)</strong> – interest is accumulating.
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400">Approved Amount</p><p className="font-bold text-navy-700">${Number(activeLoan.approvedAmount || activeLoan.requestedAmount).toFixed(2)}</p></div>
            <div><p className="text-gray-400">Outstanding Balance</p><p className="font-bold text-red-500">${Number(activeLoan.outstandingBalance || activeLoan.requestedAmount).toFixed(2)}</p></div>
            <div><p className="text-gray-400">Due Date</p><p className="font-semibold text-navy-700">{activeLoan.dueDate ? formatDate(activeLoan.dueDate) : "—"}</p></div>
            <div><p className="text-gray-400">Missed Weeks</p><p className={`font-semibold ${activeLoan.missedWeeks > 0 ? "text-red-500" : "text-green-600"}`}>{activeLoan.missedWeeks}</p></div>
          </div>
          <div className="mt-4">
            <Link href={`/admin/applications/${activeLoan.id}`} className="text-gold-500 hover:text-gold-600 text-sm font-medium">
              View Full Application →
            </Link>
          </div>
        </Card>
      )}

      {/* All Loans */}
      <Card>
        <h2 className="text-base font-bold text-navy-700 mb-4 flex items-center gap-2">
          <CreditCard size={16} className="text-gold-500" /> All Loans
        </h2>
        {client.loans.length === 0 ? (
          <p className="text-gray-400 text-sm">No loan applications.</p>
        ) : (
          client.loans.map((loan) => (
            <div key={loan.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-navy-700">${Number(loan.requestedAmount).toFixed(2)}</span>
                  <span className="text-xs text-gray-400 ml-2">{formatDate(loan.createdAt)}</span>
                </div>
                <Badge variant={loanStatusVariant(loan.status)}>{loan.status}</Badge>
              </div>
              {loan.payments.length > 0 && (
                <div className="space-y-1">
                  {loan.payments.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex justify-between text-xs text-gray-500">
                      <span>{formatDate(p.paymentDate)}</span>
                      <span className="font-medium text-green-600">Paid ${Number(p.amountPaid).toFixed(2)}</span>
                      <span>Balance: ${Number(p.balanceAfter).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

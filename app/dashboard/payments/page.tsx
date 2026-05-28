import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { formatDate } from "@/lib/utils";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const loans = await prisma.loan.findMany({
    where: { userId: session.user.id },
    include: {
      payments: { orderBy: { paymentDate: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allPayments = loans.flatMap((l) =>
    l.payments.map((p) => ({ ...p, loanAmount: l.requestedAmount }))
  );

  const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-800">Payment History</h1>
        <p className="text-gray-500 mt-1">All your recorded payments.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalPaid.toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-navy-700">{allPayments.length}</p>
        </Card>
      </div>

      <Card>
        {allPayments.length === 0 ? (
          <Alert type="info">No payment records found.</Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount Paid</th>
                  <th className="pb-3">Interest Applied</th>
                  <th className="pb-3">Balance After</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-600">{formatDate(p.paymentDate)}</td>
                    <td className="py-3 font-semibold text-green-600">${Number(p.amountPaid).toFixed(2)}</td>
                    <td className="py-3 text-orange-500 font-medium">
                      {Number(p.interestApplied) > 0 ? `+$${Number(p.interestApplied).toFixed(2)}` : "—"}
                    </td>
                    <td className="py-3 font-semibold text-navy-700">${Number(p.balanceAfter).toFixed(2)}</td>
                    <td className="py-3">
                      <Badge variant={p.status === "ON_TIME" ? "approved" : p.status === "LATE" ? "pending" : "denied"}>
                        {p.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

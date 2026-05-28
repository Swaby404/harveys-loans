import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { paymentDate: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      loan: { select: { requestedAmount: true } },
    },
  });

  const total = payments.reduce((s, p) => s + Number(p.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-800">All Payments</h1>
        <p className="text-gray-500 mt-1">{payments.length} payment records</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Collected</p>
          <p className="text-3xl font-bold text-green-600">${total.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Records</p>
          <p className="text-3xl font-bold text-navy-700">{payments.length}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="pb-3">Client</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount Paid</th>
                <th className="pb-3">Interest</th>
                <th className="pb-3">Balance After</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-navy-700">{p.user.firstName} {p.user.lastName}</p>
                    <p className="text-xs text-gray-400">{p.user.email}</p>
                  </td>
                  <td className="py-3 text-gray-600">{formatDate(p.paymentDate)}</td>
                  <td className="py-3 font-bold text-green-600">${Number(p.amountPaid).toFixed(2)}</td>
                  <td className="py-3 text-orange-500">
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
      </Card>
    </div>
  );
}

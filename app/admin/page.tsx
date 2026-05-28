import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, loanStatusVariant } from "@/components/ui/Badge";
import Link from "next/link";
import { Users, FileText, DollarSign, AlertTriangle, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [totalClients, pendingApps, activeLoans, totalPaid, overdueLoans, recentApps] =
    await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.loan.count({ where: { status: "PENDING" } }),
      prisma.loan.count({ where: { status: "APPROVED" } }),
      prisma.payment.aggregate({ _sum: { amountPaid: true } }),
      prisma.loan.count({ where: { status: "APPROVED", missedWeeks: { gt: 0 } } }),
      prisma.loan.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);

  const stats = [
    { label: "Total Clients", value: totalClients, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Applications", value: pendingApps, icon: FileText, color: "bg-yellow-50 text-yellow-600" },
    { label: "Active Loans", value: activeLoans, icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "Overdue Loans", value: overdueLoans, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all loan activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-navy-800">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Collected</p>
        <p className="text-3xl font-bold text-green-600">
          ${Number(totalPaid._sum.amountPaid ?? 0).toFixed(2)}
        </p>
      </Card>

      {/* Recent Applications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-700">Recent Applications</h2>
          <Link href="/admin/applications" className="text-sm text-gold-500 font-medium flex items-center gap-1 hover:text-gold-600">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((loan) => (
                <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-navy-700">{loan.user.firstName} {loan.user.lastName}</p>
                      <p className="text-xs text-gray-400">{loan.user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-navy-700">${Number(loan.requestedAmount).toFixed(2)}</td>
                  <td className="py-3 text-gray-500">{formatDate(loan.createdAt)}</td>
                  <td className="py-3">
                    <Badge variant={loanStatusVariant(loan.status)}>{loan.status}</Badge>
                  </td>
                  <td className="py-3">
                    <Link href={`/admin/applications/${loan.id}`} className="text-gold-500 hover:text-gold-600 text-xs font-medium">
                      Review →
                    </Link>
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

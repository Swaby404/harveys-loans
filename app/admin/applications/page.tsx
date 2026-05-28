import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, loanStatusVariant } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ApplicationsPage() {
  const loans = await prisma.loan.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });

  const pending = loans.filter((l) => l.status === "PENDING");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-navy-800">Loan Applications</h1>

      {/* Pending first */}
      {pending.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Pending Review ({pending.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="pb-3">Applicant</th>
                  <th className="pb-3">Job Title</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-50 hover:bg-yellow-50/50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-navy-700">{loan.user.firstName} {loan.user.lastName}</p>
                        <p className="text-xs text-gray-400">{loan.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{loan.jobTitle}</td>
                    <td className="py-3 font-bold text-navy-700">${Number(loan.requestedAmount).toFixed(2)}</td>
                    <td className="py-3 text-gray-500">{formatDate(loan.createdAt)}</td>
                    <td className="py-3">
                      <Link href={`/admin/applications/${loan.id}`} className="btn-primary text-xs px-3 py-1.5">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* All others */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-4">All Applications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-navy-700">{loan.user.firstName} {loan.user.lastName}</p>
                    <p className="text-xs text-gray-400">{loan.user.email}</p>
                  </td>
                  <td className="py-3 font-bold text-navy-700">${Number(loan.requestedAmount).toFixed(2)}</td>
                  <td className="py-3 text-gray-500">{formatDate(loan.createdAt)}</td>
                  <td className="py-3"><Badge variant={loanStatusVariant(loan.status)}>{loan.status}</Badge></td>
                  <td className="py-3">
                    <Link href={`/admin/applications/${loan.id}`} className="text-gold-500 hover:text-gold-600 text-xs font-medium">
                      View →
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

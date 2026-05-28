import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, loanStatusVariant } from "@/components/ui/Badge";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

export default async function AdminClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      loans: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-800">Clients</h1>
        <p className="text-gray-500 mt-1">{clients.length} registered clients</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="pb-3">Client</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Active Loan</th>
                <th className="pb-3">Balance</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const latestLoan = client.loans[0];
                return (
                  <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center text-navy-600 font-bold text-xs">
                          {getInitials(client.firstName, client.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-navy-700">{client.firstName} {client.lastName}</p>
                          <p className="text-xs text-gray-400">{client.phone || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{client.email}</td>
                    <td className="py-3">
                      {latestLoan ? (
                        <Badge variant={loanStatusVariant(latestLoan.status)}>{latestLoan.status}</Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">No loan</span>
                      )}
                    </td>
                    <td className="py-3 font-semibold text-navy-700">
                      {latestLoan?.outstandingBalance
                        ? `$${Number(latestLoan.outstandingBalance).toFixed(2)}`
                        : latestLoan?.requestedAmount
                        ? `$${Number(latestLoan.requestedAmount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="py-3">
                      <Link href={`/admin/clients/${client.id}`} className="text-gold-500 hover:text-gold-600 text-xs font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

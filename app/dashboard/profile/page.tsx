import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, createdAt: true, role: true,
      loans: { select: { id: true, status: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-800">My Profile</h1>
        <p className="text-gray-500 mt-1">Your account information.</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold text-2xl">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-800">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <User size={16} className="text-gold-500" />
            <div>
              <p className="text-gray-400 text-xs">Full Name</p>
              <p className="font-semibold text-navy-700">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <Mail size={16} className="text-gold-500" />
            <div>
              <p className="text-gray-400 text-xs">Email Address</p>
              <p className="font-semibold text-navy-700">{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <Phone size={16} className="text-gold-500" />
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <p className="font-semibold text-navy-700">{user.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <Calendar size={16} className="text-gold-500" />
            <div>
              <p className="text-gray-400 text-xs">Member Since</p>
              <p className="font-semibold text-navy-700">{formatDate(user.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <Shield size={16} className="text-gold-500" />
            <div>
              <p className="text-gray-400 text-xs">Total Applications</p>
              <p className="font-semibold text-navy-700">{user.loans.length}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-navy-50 border-navy-200">
        <p className="text-xs text-navy-700 leading-relaxed">
          <Shield size={12} className="inline mr-1 text-navy-500" />
          Your personal information is stored with AES-256 encryption and protected in compliance
          with Harvey&apos;s Loans LLC privacy policy and the Cayman Islands data protection regulations.
          We will never share or sell your data to third parties.
        </p>
      </Card>
    </div>
  );
}

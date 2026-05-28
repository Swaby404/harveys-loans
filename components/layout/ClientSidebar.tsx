"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  LogOut,
  User,
  DollarSign,
  Banknote,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, highlight: false },
  { href: "/dashboard/loan", label: "My Loan", icon: DollarSign, highlight: false },
  { href: "/dashboard/pay", label: "Make a Payment", icon: Banknote, highlight: true },
  { href: "/dashboard/payments", label: "Payment History", icon: CreditCard, highlight: false },
  { href: "/dashboard/apply", label: "Apply for Loan", icon: FileText, highlight: false },
  { href: "/dashboard/profile", label: "My Profile", icon: User, highlight: false },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy-800 min-h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-navy-700">
        <Logo variant="light" size="sm" />
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2">
        {navItems.map(({ href, label, icon: Icon, highlight }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === href
                ? "bg-gold-400 text-navy-800"
                : highlight
                ? "text-gold-400 hover:bg-navy-700 hover:text-gold-300 border border-gold-400/30"
                : "text-navy-200 hover:bg-navy-700 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-navy-700 mb-2">
          <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center text-navy-800 font-bold text-sm">
            {session?.user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-navy-300 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-navy-300 hover:text-red-400 hover:bg-navy-700 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

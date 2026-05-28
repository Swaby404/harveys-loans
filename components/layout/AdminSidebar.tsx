"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  LogOut,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy-900 min-h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-navy-700">
        <Logo variant="light" size="sm" />
        <div className="flex items-center gap-1.5 mt-3 px-2">
          <Shield size={12} className="text-gold-400" />
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gold-400 text-navy-800"
                  : "text-navy-300 hover:bg-navy-700 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-navy-800 mb-2">
          <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center text-navy-800 font-bold text-sm">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name ?? "Admin"}</p>
            <p className="text-xs text-navy-300 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-navy-300 hover:text-red-400 hover:bg-navy-800 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

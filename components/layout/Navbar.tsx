"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-sm font-medium text-navy-600 hover:text-gold-500 transition-colors">
              How It Works
            </Link>
            <Link href="/#rates" className="text-sm font-medium text-navy-600 hover:text-gold-500 transition-colors">
              Interest Rates
            </Link>
            <Link href="/#about" className="text-sm font-medium text-navy-600 hover:text-gold-500 transition-colors">
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-gold-500 transition-colors"
                >
                  {session.user.role === "ADMIN" ? (
                    <><Shield size={16} /> Admin Panel</>
                  ) : (
                    <><LayoutDashboard size={16} /> Dashboard</>
                  )}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Apply Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/#how-it-works" className="block text-sm font-medium text-navy-600 py-2" onClick={() => setMobileOpen(false)}>How It Works</Link>
          <Link href="/#rates" className="block text-sm font-medium text-navy-600 py-2" onClick={() => setMobileOpen(false)}>Interest Rates</Link>
          {session ? (
            <>
              <Link href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"} className="block text-sm font-medium text-navy-600 py-2" onClick={() => setMobileOpen(false)}>
                {session.user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left text-sm font-medium text-red-500 py-2">Sign Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Apply Now</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Mail, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo variant="light" size="md" href="/" />
            <p className="mt-4 text-navy-200 text-sm leading-relaxed max-w-sm">
              Harvey&apos;s Loans LLC is a licensed money lending company regulated under the
              Cayman Islands Money Lenders Law. We provide fast, transparent, and responsible
              short-term financing.
            </p>
            <div className="mt-4 flex items-center gap-2 text-navy-300 text-sm">
              <Shield size={14} className="text-gold-400" />
              Regulated under Cayman Islands Law
            </div>
          </div>

          <div>
            <h4 className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><Link href="/#how-it-works" className="hover:text-gold-400 transition-colors">How It Works</Link></li>
              <li><Link href="/#rates" className="hover:text-gold-400 transition-colors">Interest Rates</Link></li>
              <li><Link href="/auth/signup" className="hover:text-gold-400 transition-colors">Apply for a Loan</Link></li>
              <li><Link href="/auth/signin" className="hover:text-gold-400 transition-colors">Client Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-navy-200">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-gold-400" />
                <a href="mailto:harveysloansllc@outlook.com" className="hover:text-gold-400 transition-colors break-all">
                  harveysloansllc@outlook.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-navy-400">
                Non-refundable processing fee of <span className="text-gold-400 font-semibold">$20</span> applies to all applications.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-navy-700 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-navy-400">
          <p>© {new Date().getFullYear()} Harvey&apos;s Loans LLC. All rights reserved.</p>
          <p>Regulated under the Cayman Islands Money Lenders Law (as revised)</p>
        </div>
      </div>
    </footer>
  );
}

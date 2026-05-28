import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  CheckCircle,
  Clock,
  Shield,
  DollarSign,
  FileText,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { INTEREST_SCHEDULE_DISPLAY } from "@/lib/interest";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero-pattern pt-28 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-900/40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-gold-400/20 text-gold-300 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold-400/30">
                Regulated • Trusted • Fast
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              Your Trusted <span className="text-gold-400">Financial Partner</span> in the Cayman Islands
            </h1>
            <p className="mt-6 text-lg text-navy-200 leading-relaxed max-w-xl">
              Harvey&apos;s Loans LLC offers fast, transparent, and responsible short-term financing from{" "}
              <span className="text-gold-400 font-semibold">$50 to $5,000</span>. Apply online in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup" className="btn-primary text-base px-8 py-4 shadow-gold">
                Apply for a Loan <ArrowRight size={18} />
              </Link>
              <Link href="/auth/signin" className="btn-outline text-base px-8 py-4">
                Sign In to My Account
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-navy-300">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gold-400" /> No hidden fees</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gold-400" /> Fast approval</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gold-400" /> Regulated by Cayman law</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gold-400" /> Secure & encrypted</span>
            </div>
          </div>
        </div>

        {/* Floating card */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 w-72">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-navy-800" />
            </div>
            <div>
              <p className="text-white font-bold">Quick Loans</p>
              <p className="text-navy-300 text-xs">$50 – $5,000</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Min Loan", value: "$50" },
              { label: "Max Loan", value: "$5,000" },
              { label: "Processing Fee", value: "$20*" },
              { label: "Approval", value: "Fast" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-navy-300">{item.label}</span>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-navy-400 text-xs mt-3">*Non-refundable processing fee</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "$50–$5K", label: "Loan Range" },
              { value: "Fast", label: "Approval Time" },
              { value: "100%", label: "Online Process" },
              { value: "256-bit", label: "Data Encryption" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-display font-bold text-navy-700">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Getting a loan from Harvey&apos;s Loans is simple, fast, and fully online.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Submit Your Application",
                desc: "Fill out our secure online form with your employment details and desired loan amount. Upload your job letter and latest paystub.",
              },
              {
                step: "02",
                icon: Shield,
                title: "Quick Review & Approval",
                desc: "Our team reviews your application and documents. You receive a personalised decision email within 24 hours.",
              },
              {
                step: "03",
                icon: DollarSign,
                title: "Receive Your Funds",
                desc: "Once approved, funds are disbursed promptly. Track your balance and payments anytime through your secure dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="card group hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center group-hover:bg-gold-400 transition-colors">
                    <item.icon size={22} className="text-navy-500 group-hover:text-navy-800" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gold-500 uppercase tracking-widest">Step {item.step}</span>
                    <h3 className="mt-1 text-lg font-bold text-navy-700">{item.title}</h3>
                    <p className="mt-2 text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interest Rates */}
      <section id="rates" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title">Interest Rate Schedule</h2>
              <p className="mt-3 text-gray-500">
                Rates apply to <strong>missed payment weeks</strong> and compound on the outstanding balance.
                On-time payments incur no interest.
              </p>
            </div>

            <div className="card shadow-card">
              <div className="flex items-center gap-2 mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle size={16} className="text-yellow-600 shrink-0" />
                <p className="text-yellow-800 text-sm font-medium">
                  A non-refundable processing fee of <strong>$20</strong> applies to all approved loans.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-700 text-white">
                      <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Missed Payment</th>
                      <th className="px-6 py-3 text-center font-semibold text-xs uppercase tracking-wider">Interest Rate</th>
                      <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INTEREST_SCHEDULE_DISPLAY.map((row, i) => (
                      <tr key={row.week} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 font-medium text-navy-700">{row.label}</td>
                        <td className={`px-6 py-4 text-center font-bold text-lg ${row.color}`}>{row.rate}</td>
                        <td className="px-6 py-4 text-right text-gray-500">Compounding</td>
                      </tr>
                    ))}
                    <tr className="bg-navy-50 border-t-2 border-gold-400">
                      <td className="px-6 py-4 font-bold text-navy-700">Processing Fee</td>
                      <td className="px-6 py-4 text-center font-bold text-navy-700">$20.00</td>
                      <td className="px-6 py-4 text-right text-red-600 font-medium">Non-Refundable</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-navy-50 rounded-lg border border-navy-200">
                <p className="text-navy-700 text-xs leading-relaxed font-medium">
                  <Shield size={12} className="inline mr-1 text-navy-500" />
                  This loan is governed by the <strong>Cayman Islands Money Lenders Law (as revised)</strong>.
                  Non-payment may result in civil debt recovery proceedings under applicable Cayman law.
                  All borrowers are encouraged to maintain timely payments to avoid additional charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="py-20 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-white">Why Choose Harvey&apos;s Loans?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Bank-Grade Security", desc: "All data encrypted with AES-256. Your information is safe with us." },
              { icon: Clock, title: "Fast Decisions", desc: "Submit your application online and receive a decision quickly." },
              { icon: CheckCircle, title: "Transparent Terms", desc: "No hidden fees. All rates and terms clearly displayed upfront." },
              { icon: FileText, title: "Easy Application", desc: "Simple online form. Upload your documents digitally – no branch visit needed." },
              { icon: DollarSign, title: "Flexible Amounts", desc: "Borrow from $50 to $5,000 based on your employment and needs." },
              { icon: AlertCircle, title: "Cayman Law Compliant", desc: "Fully regulated and compliant with Cayman Islands Money Lenders Law." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-5 rounded-xl bg-navy-700/50 border border-navy-600 hover:border-gold-400/50 transition-all duration-200">
                <div className="w-10 h-10 bg-gold-400/20 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon size={18} className="text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <p className="text-navy-300 text-sm mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-navy-800">Ready to Apply?</h2>
          <p className="mt-3 text-navy-700 max-w-xl mx-auto">
            Join Harvey&apos;s Loans today. Fast approvals, transparent rates, and a team dedicated to helping you.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-secondary text-base px-8 py-4">
              Create an Account <ArrowRight size={18} />
            </Link>
            <Link href="/auth/signin" className="bg-transparent border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white font-semibold text-base px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center gap-2">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Harvey's Loans LLC – Fast & Trusted Lending in the Cayman Islands",
  description:
    "Harvey's Loans LLC provides fast, transparent, and responsible short-term financing. Apply online in minutes. Regulated under Cayman Islands Law.",
  keywords: "loans, Cayman Islands, money lending, personal loans, Harvey's Loans",
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-gray-50">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

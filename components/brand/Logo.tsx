"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "dark" | "light" | "icon-only";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function Logo({ variant = "dark", size = "md", className, href = "/" }: LogoProps) {
  const sizes = { sm: 32, md: 44, lg: 60 };
  const textSizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };
  const subtextSizes = { sm: "text-[8px]", md: "text-[10px]", lg: "text-xs" };
  const h = sizes[size];
  const isLight = variant === "light";

  const content = (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <svg
        width={h}
        height={h}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="60" height="60" rx="10" fill="#1e3a5f" />
        <text
          x="30"
          y="42"
          textAnchor="middle"
          fontSize="36"
          fontWeight="bold"
          fontFamily="Georgia, serif"
          fill="#f4c21a"
          letterSpacing="-1"
        >
          H
        </text>
        <line x1="10" y1="50" x2="50" y2="50" stroke="#f4c21a" strokeWidth="2" />
        <text
          x="30"
          y="58"
          textAnchor="middle"
          fontSize="7"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
          fill="#f4c21a"
          letterSpacing="1"
        >
          $$
        </text>
      </svg>
      {variant !== "icon-only" && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-wide",
              textSizes[size],
              isLight ? "text-white" : "text-navy-700"
            )}
          >
            Harvey&apos;s Loans
          </span>
          <span
            className={cn(
              "font-sans font-semibold tracking-widest uppercase",
              subtextSizes[size],
              isLight ? "text-gold-400" : "text-gold-500"
            )}
          >
            LLC
          </span>
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg">
      {content}
    </Link>
  ) : (
    content
  );
}

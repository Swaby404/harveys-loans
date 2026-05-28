import { cn } from "@/lib/utils";

type BadgeVariant = "pending" | "approved" | "denied" | "settled" | "defaulted" | "default";

const variants: Record<BadgeVariant, string> = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  denied: "bg-red-100 text-red-800 border border-red-200",
  settled: "bg-blue-100 text-blue-800 border border-blue-200",
  defaulted: "bg-gray-100 text-gray-700 border border-gray-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function loanStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    PENDING: "pending",
    APPROVED: "approved",
    DENIED: "denied",
    SETTLED: "settled",
    DEFAULTED: "defaulted",
  };
  return map[status] ?? "default";
}

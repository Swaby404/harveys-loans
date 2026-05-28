import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

const configs: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: <XCircle size={18} className="text-red-500 shrink-0" />,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: <AlertTriangle size={18} className="text-yellow-500 shrink-0" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: <Info size={18} className="text-blue-500 shrink-0" />,
  },
};

export function Alert({
  type = "info",
  children,
  className,
}: {
  type?: AlertType;
  children: React.ReactNode;
  className?: string;
}) {
  const c = configs[type];
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-lg border", c.bg, c.border, className)}>
      {c.icon}
      <div className={cn("text-sm font-medium", c.text)}>{children}</div>
    </div>
  );
}

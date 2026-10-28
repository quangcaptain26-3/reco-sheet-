import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "warning" | "info" | "success";

const VARIANTS: Record<
  AlertVariant,
  { container: string; icon: string; Icon: typeof Info }
> = {
  error: {
    container: "border-rose-200 bg-rose-50 text-rose-900",
    icon: "text-rose-600",
    Icon: AlertTriangle,
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "text-sky-600",
    Icon: Info,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    Icon: CheckCircle2,
  },
};

export interface InlineAlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function InlineAlert({
  variant = "info",
  title,
  children,
  onDismiss,
  className,
}: InlineAlertProps) {
  const style = VARIANTS[variant];
  const Icon = style.Icon;

  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
        style.container,
        className
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", style.icon)} aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="text-[13px] leading-relaxed">{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
          className="-mr-1 rounded p-0.5 opacity-70 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

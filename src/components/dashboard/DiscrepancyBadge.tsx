import { Badge } from "@/components/ui/badge";
import { formatDelta } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DiscrepancyBadgeProps {
  delta: string | null;
  className?: string;
}

/** Renders Δ = B − A with an explicit sign and warning colours. */
export function DiscrepancyBadge({ delta, className }: DiscrepancyBadgeProps) {
  if (delta === null) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-amber-200 bg-amber-50 font-normal text-amber-700",
          className
        )}
        title="Không thể so sánh vì một trong hai giá trị không phải số"
      >
        Không so sánh được
      </Badge>
    );
  }

  const numeric = Number(delta);
  const isZero = numeric === 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-semibold tabular-nums",
        isZero && "bg-emerald-50 text-emerald-700",
        numeric > 0 && "bg-amber-100 text-amber-800",
        numeric < 0 && "bg-rose-100 text-rose-800",
        className
      )}
      title="Chênh lệch = Giá trị B − Giá trị A"
    >
      {formatDelta(delta)}
    </Badge>
  );
}

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Rows3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  formatAmount,
  formatCount,
  formatDelta,
  formatDuration,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReconcileConfig, ReconcileSummary } from "@/types/reconciliation";

interface SummaryCardsProps {
  summary: ReconcileSummary;
  config: ReconcileConfig;
  elapsedMs: number;
}

interface KpiCardProps {
  label: string;
  value: number;
  /** Optional prominent value, e.g. the signed total Δ. */
  displayValue?: string;
  hint: string;
  icon: typeof CheckCircle2;
  tone: "emerald" | "amber" | "rose" | "sky";
}

const TONES = {
  emerald: {
    card: "from-emerald-50/90 to-background ring-emerald-200/70",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-700",
  },
  amber: {
    card: "from-amber-50/90 to-background ring-amber-200/70",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-700",
  },
  rose: {
    card: "from-rose-50/90 to-background ring-rose-200/70",
    icon: "bg-rose-100 text-rose-700",
    value: "text-rose-700",
  },
  sky: {
    card: "from-sky-50/90 to-background ring-sky-200/70",
    icon: "bg-sky-100 text-sky-700",
    value: "text-sky-700",
  },
} as const;

function KpiCard({
  label,
  value,
  displayValue,
  hint,
  icon: Icon,
  tone,
}: KpiCardProps) {
  const palette = TONES[tone];

  return (
    <Card
      className={cn(
        "gap-0 border-0 bg-linear-to-b py-4 shadow-sm ring-1",
        palette.card
      )}
    >
      <div className="flex items-start justify-between gap-2 px-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-foreground/70 uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-1.5 font-heading text-2xl font-semibold tabular-nums",
              palette.value
            )}
            title={displayValue ?? formatCount(value)}
          >
            {displayValue ?? formatCount(value)}
          </p>
        </div>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            palette.icon
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 px-4 text-[11px] leading-relaxed text-foreground/70">
        {hint}
      </p>
    </Card>
  );
}

function provenanceLabel(value: boolean): string {
  return value ? "Bật" : "Tắt";
}

export function SummaryCards({
  summary,
  config,
  elapsedMs,
}: SummaryCardsProps) {
  const skipped = summary.skippedA + summary.skippedB;
  const pairedKeys = summary.matched + summary.discrepancy;
  const missingKeys = summary.onlyInA + summary.onlyInB;

  const issueParts: string[] = [];
  if (summary.discrepancy > 0) {
    issueParts.push(`${formatCount(summary.discrepancy)} dòng lệch giá trị`);
  }
  if (missingKeys > 0) {
    issueParts.push(`${formatCount(missingKeys)} mã thiếu`);
  }

  const hasIssues = issueParts.length > 0;
  const verdict = hasIssues
    ? `Chưa khớp: ${issueParts.join(", ")} — cần kiểm tra trước khi gửi.`
    : "Khớp toàn bộ — sẵn sàng xuất báo cáo.";

  return (
    <div className="space-y-3">
      <div
        role="status"
        className={cn(
          "flex items-start gap-2.5 rounded-lg border px-4 py-2.5 text-sm",
          hasIssues
            ? "border-amber-200 bg-amber-50/80 text-amber-900"
            : "border-emerald-200 bg-emerald-50/80 text-emerald-900"
        )}
      >
        {hasIssues ? (
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-700"
            aria-hidden
          />
        ) : (
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-emerald-700"
            aria-hidden
          />
        )}
        <p className="font-medium">{verdict}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-border/70 bg-muted/25 px-4 py-2.5 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">Thiết lập đã dùng</span>
        <span>
          {config.keyColumnA} ↔ {config.keyColumnB}
        </span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <span>
          {config.valueColumnA && config.valueColumnB
            ? `${config.valueColumnA} ↔ ${config.valueColumnB}`
            : "Chỉ đối chiếu mã"}
        </span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <span>Dung sai ±{formatAmount(config.tolerance)}</span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <span>
          Tự cắt: {provenanceLabel(config.autoTrim)} · Hoa/thường:{" "}
          {provenanceLabel(config.caseInsensitive)} · Bỏ dấu:{" "}
          {provenanceLabel(config.stripPunctuation)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Khớp hoàn toàn"
          value={summary.matched}
          hint="Mã khớp và giá trị nằm trong dung sai cho phép."
          icon={CheckCircle2}
          tone="emerald"
        />
        <KpiCard
          label="Lệch giá trị"
          value={summary.discrepancy}
          displayValue={formatDelta(summary.totalDelta)}
          hint={`${formatCount(summary.discrepancy)} dòng lệch giá trị`}
          icon={AlertTriangle}
          tone="amber"
        />
        <KpiCard
          label="Chỉ có ở tệp A"
          value={summary.onlyInA}
          hint="Mã xuất hiện trong nguồn đối chiếu nhưng thiếu ở tệp B."
          icon={ArrowLeft}
          tone="rose"
        />
        <KpiCard
          label="Chỉ có ở tệp B"
          value={summary.onlyInB}
          hint="Mã xuất hiện trong nguồn so sánh nhưng thiếu ở tệp A."
          icon={ArrowRight}
          tone="sky"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border/70 bg-muted/25 px-4 py-2.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Rows3 className="size-3.5" aria-hidden />
          Đã đối chiếu {formatCount(pairedKeys)} cặp khóa
          <span className="text-border" aria-hidden>
            ·
          </span>
          A: {formatCount(summary.totalA)} dòng / B: {formatCount(summary.totalB)}{" "}
          dòng
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" aria-hidden />
          Thuật toán hoàn tất trong {formatDuration(elapsedMs)}
        </span>
        {skipped > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-amber-700">
            <AlertTriangle className="size-3.5" aria-hidden />
            Bỏ qua {formatCount(skipped)} dòng có khóa trống
          </span>
        ) : null}
      </div>
    </div>
  );
}

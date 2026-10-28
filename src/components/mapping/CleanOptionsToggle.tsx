"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-[13px] font-medium">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
          checked
            ? "bg-emerald-600 ring-emerald-600/30"
            : "bg-muted ring-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 flex size-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        >
          {checked ? (
            <Check className="size-2.5 text-emerald-700" aria-hidden />
          ) : null}
        </span>
      </button>
    </div>
  );
}

interface CleanOptionsToggleProps {
  autoTrim: boolean;
  caseInsensitive: boolean;
  stripPunctuation: boolean;
  onAutoTrimChange: (checked: boolean) => void;
  onCaseInsensitiveChange: (checked: boolean) => void;
  onStripPunctuationChange: (checked: boolean) => void;
}

export function CleanOptionsToggle({
  autoTrim,
  caseInsensitive,
  stripPunctuation,
  onAutoTrimChange,
  onCaseInsensitiveChange,
  onStripPunctuationChange,
}: CleanOptionsToggleProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
      <ToggleRow
        id="toggle-auto-trim"
        label="Tự cắt khoảng trắng"
        description="Cắt khoảng trắng ẩn, gộp khoảng trắng giữa chuỗi và bỏ ký tự zero-width."
        checked={autoTrim}
        onChange={onAutoTrimChange}
      />
      <div className="h-px bg-border/70" />
      <ToggleRow
        id="toggle-case-insensitive"
        label="Không phân biệt hoa/thường"
        description="ORD-101 và ord-101 được xem là cùng một mã."
        checked={caseInsensitive}
        onChange={onCaseInsensitiveChange}
      />
      <div className="h-px bg-border/70" />
      <ToggleRow
        id="toggle-strip-punctuation"
        label="Bỏ dấu phân cách"
        description="Loại bỏ -, ., _, / trong mã. Dùng khi hai hệ thống đặt mã khác quy ước."
        checked={stripPunctuation}
        onChange={onStripPunctuationChange}
      />
    </div>
  );
}

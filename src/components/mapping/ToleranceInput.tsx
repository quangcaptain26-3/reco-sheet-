"use client";

import { Input } from "@/components/ui/input";

interface ToleranceInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function ToleranceInput({
  id,
  value,
  onChange,
  error,
}: ToleranceInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-medium">
        Dung sai cho phép
      </label>

      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help`}
          className="bg-background pr-10 text-right tabular-nums"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          đơn vị
        </span>
      </div>

      <p
        id={`${id}-help`}
        className={error ? "text-[11px] text-rose-600" : "text-[11px] text-muted-foreground"}
      >
        {error ??
          "Chênh lệch trong khoảng ±X được xem là khớp. Mặc định 0 (khớp tuyệt đối)."}
      </p>
    </div>
  );
}

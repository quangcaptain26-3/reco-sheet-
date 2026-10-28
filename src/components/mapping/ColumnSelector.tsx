"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnSchema } from "@/types/spreadsheet";
import { cn } from "@/lib/utils";

interface ColumnSelectorProps {
  id: string;
  label: string;
  hint?: string;
  hintTone?: "muted" | "warning";
  columns: ColumnSchema[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}

export function ColumnSelector({
  id,
  label,
  hint,
  hintTone = "muted",
  columns,
  value,
  onChange,
  placeholder = "Chọn cột…",
  disabled = false,
  required = false,
  invalid = false,
}: ColumnSelectorProps) {
  const isEmpty = columns.length === 0;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1 text-[13px] font-medium"
      >
        {label}
        {required ? (
          <span className="text-rose-600" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      <Select
        value={value || null}
        onValueChange={(nextValue) => onChange(nextValue ?? "")}
        disabled={disabled || isEmpty}
      >
        <SelectTrigger
          id={id}
          className="w-full bg-background"
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
        >
          <SelectValue placeholder={isEmpty ? "Chưa có tệp" : placeholder} />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          {columns.map((column) => (
            <SelectItem key={column.name} value={column.name}>
              {column.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hint ? (
        <p
          id={hintId}
          className={cn(
            "text-[11px] leading-relaxed",
            hintTone === "warning" ? "text-amber-700" : "text-muted-foreground"
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

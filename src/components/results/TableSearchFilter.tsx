"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCount } from "@/lib/format";

interface TableSearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  matchedCount: number;
  totalCount: number;
  placeholder?: string;
}

export function TableSearchFilter({
  value,
  onChange,
  matchedCount,
  totalCount,
  placeholder = "Tìm nhanh theo mã khóa…",
}: TableSearchFilterProps) {
  return (
    <div className="flex w-full flex-col gap-1.5 sm:max-w-sm">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label="Tìm kiếm trong bảng kết quả"
          className="bg-background pr-8 pl-8"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Xoá từ khoá tìm kiếm"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {value
          ? `${formatCount(matchedCount)} / ${formatCount(totalCount)} dòng khớp từ khoá`
          : `${formatCount(totalCount)} dòng trong nhóm này`}
      </p>
    </div>
  );
}

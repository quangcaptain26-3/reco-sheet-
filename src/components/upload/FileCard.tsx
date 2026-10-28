"use client";

import { Eye, FileSpreadsheet, Rows3, Trash2, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCount, formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ParsedSheet } from "@/types/spreadsheet";

interface FileCardProps {
  sheet: ParsedSheet;
  accent?: "emerald" | "sky";
  onPreview: () => void;
  onRemove: () => void;
  onReplace: () => void;
}

export function FileCard({
  sheet,
  accent = "emerald",
  onPreview,
  onRemove,
  onReplace,
}: FileCardProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-muted/25 p-3">
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            accent === "sky"
              ? "bg-sky-100 text-sky-700"
              : "bg-emerald-100 text-emerald-700"
          )}
        >
          <FileSpreadsheet className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={sheet.fileName}>
            {sheet.fileName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {formatFileSize(sheet.fileSize)}
            {sheet.sheetName !== sheet.fileName
              ? ` · Sheet “${sheet.sheetName}”`
              : null}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Xoá ${sheet.fileName}`}
          title="Xoá tệp"
        >
          <Trash2 className="text-muted-foreground" aria-hidden />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 ring-1 ring-border/70">
          <Rows3 className="size-3" aria-hidden />
          {formatCount(sheet.rowCount)} dòng
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 ring-1 ring-border/70">
          <Columns3 className="size-3" aria-hidden />
          {formatCount(sheet.columns.length)} cột
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onPreview}>
          <Eye aria-hidden />
          Xem trước
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReplace}>
          Thay tệp
        </Button>
      </div>
    </div>
  );
}

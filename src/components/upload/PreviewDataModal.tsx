"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount } from "@/lib/format";
import type { ParsedSheet } from "@/types/spreadsheet";

interface PreviewDataModalProps {
  sheet: ParsedSheet | null;
  open: boolean;
  onClose: () => void;
}

export function PreviewDataModal({
  sheet,
  open,
  onClose,
}: PreviewDataModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const pageRoot = document.getElementById("top");
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    pageRoot?.setAttribute("inert", "");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      pageRoot?.removeAttribute("inert");
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open || !sheet || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        aria-describedby="preview-summary"
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl ring-1 ring-foreground/10"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h3 id="preview-title" className="truncate text-sm font-semibold">
              Xem trước · {sheet.fileName}
            </h3>
            <p id="preview-summary" className="mt-1 text-xs text-muted-foreground">
              {formatCount(sheet.rowCount)} dòng · {formatCount(sheet.columns.length)} cột ·
              hiển thị {Math.min(sheet.preview.length, 5)} dòng đầu tiên
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng xem trước"
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-12 text-center text-[11px] uppercase">
                  #
                </TableHead>
                {sheet.columns.map((column) => (
                  <TableHead
                    key={column.name}
                    className="text-[11px] font-semibold uppercase"
                  >
                    {column.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sheet.preview.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  {sheet.columns.map((column) => (
                    <TableCell
                      key={column.name}
                      className="max-w-[220px] truncate text-xs"
                      title={String(row[column.name] ?? "")}
                    >
                      {row[column.name] === null || row[column.name] === ""
                        ? "—"
                        : String(row[column.name])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-3 text-[11px] text-muted-foreground">
          <span>
            Dữ liệu được đọc trực tiếp trong trình duyệt, không gửi lên máy chủ.
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

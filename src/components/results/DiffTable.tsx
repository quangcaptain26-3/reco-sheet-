"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { DiscrepancyBadge } from "@/components/dashboard/DiscrepancyBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DiffRecord, MatchStatus } from "@/types/reconciliation";

const PAGE_SIZE = 50;

const STATUS_META: Record<
  MatchStatus,
  { label: string; className: string; rowClassName: string }
> = {
  matched: {
    label: "Khớp",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    rowClassName: "",
  },
  discrepancy: {
    label: "Lệch giá trị",
    className: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    rowClassName: "bg-amber-50/45 hover:bg-amber-50/70",
  },
  onlyInA: {
    label: "Chỉ có ở A",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    rowClassName: "bg-rose-50/35 hover:bg-rose-50/60",
  },
  onlyInB: {
    label: "Chỉ có ở B",
    className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    rowClassName: "bg-sky-50/35 hover:bg-sky-50/60",
  },
};

function rawKeyHint(record: DiffRecord): string | null {
  const candidates = [record.keyA, record.keyB];
  for (const raw of candidates) {
    if (raw && raw !== record.key) {
      return raw;
    }
  }
  return null;
}

interface DiffTableProps {
  records: DiffRecord[];
  emptyLabel: string;
  emptyHint?: string;
}

export function DiffTable({
  records,
  emptyLabel,
  emptyHint = "Nhóm này chưa có dòng nào.",
}: DiffTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = useMemo(
    () => records.slice(startIndex, startIndex + PAGE_SIZE),
    [records, startIndex]
  );

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
        <Inbox className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">{emptyLabel}</p>
        <p className="max-w-sm text-[11px] text-muted-foreground">
          {emptyHint}
        </p>
      </div>
    );
  }

  const endIndex = Math.min(startIndex + PAGE_SIZE, records.length);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border/80">
        <div className="max-h-[540px] overflow-auto">
          <Table>
            <TableCaption className="sr-only">
              Bảng kết quả đối soát
            </TableCaption>
            <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
              <TableRow>
                <TableHead scope="col" className="min-w-[150px]">
                  Mã khóa
                </TableHead>
                <TableHead scope="col" className="w-20 text-right">
                  Dòng A
                </TableHead>
                <TableHead scope="col" className="w-20 text-right">
                  Dòng B
                </TableHead>
                <TableHead scope="col" className="w-32 text-right">
                  Giá trị A
                </TableHead>
                <TableHead scope="col" className="w-32 text-right">
                  Giá trị B
                </TableHead>
                <TableHead scope="col" className="w-36 text-right">
                  Chênh lệch
                </TableHead>
                <TableHead scope="col" className="w-28">
                  Trạng thái
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((record) => {
                const meta = STATUS_META[record.status];
                const hint = rawKeyHint(record);

                return (
                  <TableRow key={record.id} className={meta.rowClassName}>
                    <TableCell className="max-w-[260px]">
                      <span className="block truncate font-medium" title={record.key}>
                        {record.key}
                      </span>
                      {hint ? (
                        <span
                          className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground"
                          title={hint}
                        >
                          Gốc: “{hint}”
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                      {record.rowNumberA ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                      {record.rowNumberB ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {formatAmount(record.valueA)}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {formatAmount(record.valueB)}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.status === "onlyInA" || record.status === "onlyInB" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <DiscrepancyBadge delta={record.delta} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border-0 font-normal", meta.className)}
                      >
                        {meta.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          Hiển thị {formatCount(startIndex + 1)}–{formatCount(endIndex)} /{" "}
          {formatCount(records.length)} dòng
        </span>

        {totalPages > 1 ? (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft aria-hidden />
              Trước
            </Button>
            <span className="px-1 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

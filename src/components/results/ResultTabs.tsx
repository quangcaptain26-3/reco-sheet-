"use client";

import { InlineAlert } from "@/components/shared/InlineAlert";
import { DiffTable } from "@/components/results/DiffTable";
import { ExportButton } from "@/components/results/ExportButton";
import { TableSearchFilter } from "@/components/results/TableSearchFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCount } from "@/lib/format";
import type {
  DiffRecord,
  MatchGroup,
  ReconcileResult,
} from "@/types/reconciliation";

interface ResultTabsProps {
  result: ReconcileResult;
  activeTab: MatchGroup;
  onTabChange: (tab: MatchGroup) => void;
  search: string;
  onSearchChange: (search: string) => void;
  /** Already filtered by `useReconciler` for the active tab. */
  filteredRecords: DiffRecord[];
  isExporting: boolean;
  exportError: string | null;
  onExport: () => void;
  onDismissExportError: () => void;
}

export function ResultTabs({
  result,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  filteredRecords,
  isExporting,
  exportError,
  onExport,
  onDismissExportError,
}: ResultTabsProps) {
  const tabConfigs = [
    {
      value: "discrepancy" as const,
      label: "Lệch giá trị",
      records: result.discrepancy,
      emptyLabel: "Không phát hiện dòng lệch giá trị nào.",
    },
    {
      value: "onlyInA" as const,
      label: "Chỉ có ở A",
      records: result.onlyInA,
      emptyLabel: "Mọi mã trong tệp A đều xuất hiện ở tệp B.",
    },
    {
      value: "onlyInB" as const,
      label: "Chỉ có ở B",
      records: result.onlyInB,
      emptyLabel: "Mọi mã trong tệp B đều xuất hiện ở tệp A.",
    },
    {
      value: "matched" as const,
      label: "Khớp hoàn toàn",
      records: result.matched,
      emptyLabel: "Không có dòng nào khớp hoàn toàn.",
    },
  ];

  const activeTabConfig =
    tabConfigs.find((item) => item.value === activeTab) ?? tabConfigs[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-semibold tracking-tight">
            Bảng kết quả chi tiết
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Lọc theo 4 nhóm, tìm nhanh mã khóa và tải báo cáo Excel.
          </p>
        </div>
        <ExportButton onClick={onExport} isExporting={isExporting} />
      </div>

      {exportError ? (
        <InlineAlert variant="error" onDismiss={onDismissExportError}>
          {exportError}
        </InlineAlert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <TableSearchFilter
          value={search}
          onChange={onSearchChange}
          matchedCount={filteredRecords.length}
          totalCount={activeTabConfig.records.length}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (typeof value === "string") {
            onTabChange(value as MatchGroup);
          }
        }}
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/60 p-1 sm:grid-cols-4">
          {tabConfigs.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="h-9 w-full gap-1.5 px-2 text-xs sm:text-[13px]"
            >
              <span className="truncate">{item.label}</span>
              <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground ring-1 ring-border/60">
                {formatCount(item.records.length)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfigs.map((item) => (
          <TabsContent key={item.value} value={item.value} className="mt-3">
            <DiffTable
              key={`${item.value}:${search}`}
              records={
                item.value === activeTab ? filteredRecords : item.records
              }
              emptyLabel={
                search && item.value === activeTab
                  ? "Không tìm thấy mã phù hợp với từ khoá."
                  : item.emptyLabel
              }
              emptyHint={
                search && item.value === activeTab
                  ? "Thử xoá từ khoá hoặc chuyển sang nhóm khác."
                  : undefined
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

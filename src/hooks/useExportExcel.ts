"use client";

import { useCallback, useState } from "react";
import {
  buildExportFileName,
  createReconciliationReport,
  type ExportOptions,
} from "@/lib/engine/exporter";
import { logger } from "@/lib/logger";
import type { ReconcileResult } from "@/types/reconciliation";

export interface UseExportExcelState {
  isExporting: boolean;
  error: string | null;
  exportExcel: (
    result: ReconcileResult,
    options?: ExportOptions
  ) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Builds the Excel report in memory and triggers a browser download.
 * `exceljs` and `file-saver` are imported lazily inside the handler so the
 * server prerender never touches browser globals.
 */
export function useExportExcel(): UseExportExcelState {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportExcel = useCallback(
    async (result: ReconcileResult, options: ExportOptions = {}) => {
      setIsExporting(true);
      setError(null);

      try {
        const report = await createReconciliationReport(result, options);

        const fileSaverModule = await import("file-saver");
        const saveAs =
          (
            fileSaverModule as unknown as {
              default?: (blob: Blob, fileName?: string) => void;
            }
          ).default ?? fileSaverModule.saveAs;

        saveAs(report.blob, report.fileName || buildExportFileName());

        logger.info("Export", "Excel report generated", {
          bytes: report.blob.size,
        });

        return true;
      } catch (exportError) {
        setError(
          exportError instanceof Error
            ? exportError.message
            : "Không thể tạo tệp báo cáo Excel. Vui lòng thử lại."
        );

        logger.error("Export", "Failed to generate Excel report", {
          reason: exportError instanceof Error ? exportError.name : "UNKNOWN",
        });

        return false;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { isExporting, error, exportExcel, clearError };
}

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { reconcileRows } from "@/lib/engine/matcher";
import { logger } from "@/lib/logger";
import type { RowData } from "@/types/spreadsheet";
import type {
  DiffRecord,
  MatchGroup,
  ReconcileConfig,
  ReconcileResult,
  ReconciliationResult,
} from "@/types/reconciliation";

export interface UseReconcilerState {
  result: ReconciliationResult | null;
  isRunning: boolean;
  error: string | null;
  run: (
    rowsA: RowData[],
    rowsB: RowData[],
    config: ReconcileConfig
  ) => Promise<boolean>;
  reset: () => void;
  clearError: () => void;
  /** Result tab currently displayed in the UI. */
  activeTab: MatchGroup;
  setActiveTab: (tab: MatchGroup) => void;
  /** Search term applied to the active tab. */
  search: string;
  setSearch: (search: string) => void;
  /** Rows of the active tab (memoized). */
  activeTabRecords: DiffRecord[];
  /** Rows of the active tab after applying the search filter (memoized). */
  filteredRecords: DiffRecord[];
}

function defaultTab(result: ReconcileResult): MatchGroup {
  if (result.summary.discrepancy > 0) {
    return "discrepancy";
  }
  if (result.summary.onlyInA > 0) {
    return "onlyInA";
  }
  if (result.summary.onlyInB > 0) {
    return "onlyInB";
  }
  return "matched";
}

/**
 * Coordinates a reconciliation run and stores the classified result.
 * The heavy lifting stays in the pure engine; this hook manages run state and
 * exposes memoized tab/search selectors so UI components stay presentational.
 */
export function useReconciler(): UseReconcilerState {
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MatchGroup>("discrepancy");
  const [search, setSearch] = useState("");
  const runIdRef = useRef(0);

  const run = useCallback(
    async (
      rowsA: RowData[],
      rowsB: RowData[],
      config: ReconcileConfig
    ): Promise<boolean> => {
      setIsRunning(true);
      setError(null);

      // Yield once so the browser can paint the loading state before the
      // synchronous O(N + M) matching loop starts.
      await new Promise((resolve) => setTimeout(resolve, 0));

      try {
        const startedAt = performance.now();
        const engineResult = reconcileRows(rowsA, rowsB, config);
        const elapsedMs = Math.max(performance.now() - startedAt, 0);

        runIdRef.current += 1;
        setResult({ ...engineResult, elapsedMs, runId: runIdRef.current });
        setSearch("");
        setActiveTab(defaultTab(engineResult));

        logger.info("Reconciler", "Reconciliation finished", {
          rowsA: rowsA.length,
          rowsB: rowsB.length,
          elapsedMs: Math.round(elapsedMs),
          discrepancy: engineResult.summary.discrepancy,
        });

        return true;
      } catch (runError) {
        const message =
          runError instanceof Error
            ? runError.message
            : "Đã xảy ra lỗi khi đối soát. Vui lòng thử lại.";

        setResult(null);
        setError(message);

        logger.error("Reconciler", "Reconciliation failed", {
          reason: runError instanceof Error ? runError.name : "UNKNOWN",
        });

        return false;
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  const activeTabRecords = useMemo<DiffRecord[]>(() => {
    if (!result) {
      return [];
    }
    return result[activeTab];
  }, [result, activeTab]);

  const filteredRecords = useMemo<DiffRecord[]>(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return activeTabRecords;
    }

    return activeTabRecords.filter((record) => {
      return (
        record.key.includes(term) ||
        (record.keyA?.toLowerCase().includes(term) ?? false) ||
        (record.keyB?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [activeTabRecords, search]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsRunning(false);
    setSearch("");
    setActiveTab("discrepancy");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    result,
    isRunning,
    error,
    run,
    reset,
    clearError,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    activeTabRecords,
    filteredRecords,
  };
}

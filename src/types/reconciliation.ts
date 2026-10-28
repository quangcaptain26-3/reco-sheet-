/**
 * Domain contracts for the reconciliation engine.
 */

import type { RowData } from "./spreadsheet";

export type MatchStatus = "matched" | "discrepancy" | "onlyInA" | "onlyInB";

export type MatchGroup = "matched" | "discrepancy" | "onlyInA" | "onlyInB";

/** User choices coming from the mapping step. */
export interface ReconcileConfig {
  keyColumnA: string;
  keyColumnB: string;
  /** `null` when the user only wants to reconcile identifiers. */
  valueColumnA: string | null;
  valueColumnB: string | null;
  /** Absolute tolerance, in the same unit as the values. */
  tolerance: number;
  autoTrim: boolean;
  caseInsensitive: boolean;
  stripPunctuation: boolean;
}

/** One line of the result grid. */
export interface DiffRecord {
  id: string;
  status: MatchStatus;
  /** Normalised key used for matching. */
  key: string;
  /** Original (raw) identifier, kept for traceability. */
  keyA: string | null;
  keyB: string | null;
  valueA: number | null;
  valueB: number | null;
  /** Exact `B - A` as a decimal string (big.js), `null` when not comparable. */
  delta: string | null;
  /** 1-based Excel-style row number (header is row 1). */
  rowNumberA: number | null;
  rowNumberB: number | null;
  rawA: RowData | null;
  rawB: RowData | null;
}

export interface DuplicateKeySummary {
  key: string;
  occurrences: number;
}

export interface ReconcileSummary {
  totalA: number;
  totalB: number;
  /** Rows ignored because their key cell was empty. */
  skippedA: number;
  skippedB: number;
  matched: number;
  discrepancy: number;
  onlyInA: number;
  onlyInB: number;
  /** Sum of discrepancies (`B - A`) as an exact decimal string. */
  totalDelta: string;
}

/** Pure engine output (no timing information). */
export interface ReconcileResult {
  matched: DiffRecord[];
  discrepancy: DiffRecord[];
  onlyInA: DiffRecord[];
  onlyInB: DiffRecord[];
  summary: ReconcileSummary;
  duplicatesA: DuplicateKeySummary[];
  duplicatesB: DuplicateKeySummary[];
  config: ReconcileConfig;
}

/** Engine output plus the wall-clock time measured by the coordination layer. */
export interface ReconciliationResult extends ReconcileResult {
  /** Wall-clock time measured by the coordination layer. */
  elapsedMs: number;
  /** Monotonic identifier so the UI can reset per-run state. */
  runId: number;
}

export type ResultTabValue = MatchGroup;

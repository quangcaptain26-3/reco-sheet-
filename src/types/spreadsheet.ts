/**
 * Domain contracts for spreadsheet data.
 *
 * This module is dependency-free. It is shared by the pure engine, the React
 * hooks and the presentation layer.
 */

export type CellValue = string | number | boolean | null;

/** A single spreadsheet row keyed by column name. */
export type RowData = Record<string, CellValue>;

export interface ColumnSchema {
  /** Display name (trimmed, de-duplicated). */
  name: string;
  /** Zero-based column index in the source sheet. */
  index: number;
}

/** Result of parsing a spreadsheet file entirely in memory. */
export interface ParsedSheet {
  fileName: string;
  /** File size in bytes. */
  fileSize: number;
  /** Name of the sheet that was read (CSV files use the file name). */
  sheetName: string;
  columns: ColumnSchema[];
  rows: RowData[];
  /** First five rows, used by the preview modal. */
  preview: RowData[];
  rowCount: number;
}

/** Minimum file-like contract required by the parser (File/Blob friendly). */
export interface SpreadsheetFileLike {
  name: string;
  size?: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export type SpreadsheetErrorCode =
  | "UNSUPPORTED_FORMAT"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "INVALID_FILE"
  | "INVALID_CSV"
  | "NO_HEADER"
  | "NO_ROWS"
  | "LEGACY_XLS_UNSUPPORTED"
  | "PARSE_FAILED";

/**
 * Normalised, user-friendly parse error. The UI maps `code` to a message and
 * must never crash the page when a malformed file is dropped.
 */
export class SpreadsheetParseError extends Error {
  readonly code: SpreadsheetErrorCode;
  readonly cause?: unknown;

  constructor(
    code: SpreadsheetErrorCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message);
    this.name = "SpreadsheetParseError";
    this.code = code;
    this.cause = options?.cause;
  }
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const SUPPORTED_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;
export const PREVIEW_ROW_COUNT = 5;

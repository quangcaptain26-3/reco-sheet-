/**
 * Excel report exporter (ExcelJS, 1 summary sheet + 4 result sheets).
 *
 * The library is imported dynamically so that the module can be loaded without
 * touching `window` during the Next.js prerender phase.
 */

import type { RowData } from "../../types/spreadsheet";
import type { DiffRecord, ReconcileResult } from "../../types/reconciliation";

export const REPORT_SHEET_NAMES = {
  summary: "Tổng quan",
  discrepancy: "Lệch giá trị",
  onlyInA: "Chỉ có ở A",
  onlyInB: "Chỉ có ở B",
  matched: "Khớp hoàn toàn",
} as const;

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const COLORS = {
  header: "FF1F4E78",
  headerText: "FFFFFFFF",
  discrepancy: "FFFFF2CC",
  discrepancyText: "FFC00000",
  onlyInA: "FFFCE4D6",
  onlyInB: "FFDDEBF7",
  matched: "FFE2EFDA",
  title: "FF0F172A",
  muted: "FF64748B",
  zebra: "FFF8FAFC",
} as const;

const AMOUNT_FORMAT = "#,##0.###";

type ExcelModule = typeof import("exceljs");
type Workbook = import("exceljs").Workbook;
type Worksheet = import("exceljs").Worksheet;

async function loadExcelJs(): Promise<ExcelModule> {
  const imported = (await import("exceljs")) as ExcelModule & {
    default?: ExcelModule;
  };
  return imported.default?.Workbook ? imported.default : imported;
}

export interface ExportOptions {
  generatedAt?: Date;
  fileNameA?: string;
  fileNameB?: string;
  sheetNameA?: string;
  sheetNameB?: string;
  elapsedMs?: number;
}

function safeCellText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = typeof value === "string" ? value : String(value);

  // Neutralise spreadsheet formula injection in user-provided text.
  if (/^[=+\-@\t\r]/.test(text) && !/^-?\d+(?:[.,]\d+)?$/.test(text)) {
    return `'${text}`;
  }

  return text;
}

function formatNumber(value: number | null): number | string {
  return value === null ? "" : value;
}

function formatDelta(value: string | null): number | string {
  if (value === null) {
    return "";
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function formatTolerance(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 6,
  }).format(value);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function styleHeaderRow(worksheet: Worksheet, rowNumber: number): void {
  const row = worksheet.getRow(rowNumber);

  row.height = 24;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.header },
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
    };
  });
}

function paintRow(
  worksheet: Worksheet,
  rowNumber: number,
  color: string
): void {
  const row = worksheet.getRow(rowNumber);
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: color },
    };
  });
}

function autoWidth(worksheet: Worksheet, headers: string[], rows: (string | number)[][]) {
  headers.forEach((header, index) => {
    const longest = rows.reduce((max, row) => {
      const value = row[index];
      const length = value === null || value === undefined ? 0 : String(value).length;
      return Math.max(max, length);
    }, header.length);

    const column = worksheet.getColumn(index + 1);
    column.width = Math.min(Math.max(longest + 2, 10), 42);
  });
}

function writeDataSheet(
  workbook: Workbook,
  title: string,
  headers: string[],
  rows: (string | number)[][],
  options: {
    rowColor: string;
    amountColumns: number[];
    deltaColumn?: number;
    emptyMessage: string;
  }
): Worksheet {
  const worksheet = workbook.addWorksheet(title, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.addRow(headers);
  styleHeaderRow(worksheet, 1);

  if (rows.length === 0) {
    const row = worksheet.addRow([options.emptyMessage]);
    row.font = { italic: true, color: { argb: COLORS.muted } };
    worksheet.mergeCells(2, 1, 2, Math.max(headers.length, 1));
  } else {
    rows.forEach((values) => {
      const row = worksheet.addRow(values);
      paintRow(worksheet, row.number, options.rowColor);

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { vertical: "middle", wrapText: false };
      });

      for (const columnIndex of options.amountColumns) {
        const cell = worksheet.getCell(row.number, columnIndex);
        if (typeof values[columnIndex - 1] === "number") {
          cell.numFmt = AMOUNT_FORMAT;
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }
      }

      if (options.deltaColumn) {
        const deltaCell = worksheet.getCell(row.number, options.deltaColumn);
        if (typeof values[options.deltaColumn - 1] === "number") {
          deltaCell.numFmt = AMOUNT_FORMAT;
          deltaCell.font = { bold: true, color: { argb: COLORS.discrepancyText } };
          deltaCell.alignment = { vertical: "middle", horizontal: "right" };
        }
      }
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };
  }

  autoWidth(worksheet, headers, rows);

  return worksheet;
}

function rawColumnNames(records: DiffRecord[], side: "A" | "B"): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const raw = side === "A" ? record.rawA : record.rawB;
    if (!raw) {
      continue;
    }

    for (const name of Object.keys(raw)) {
      const label = `${side} · ${name}`;
      if (!seen.has(label)) {
        seen.add(label);
        names.push(name);
      }
    }
  }

  return names;
}

function rawValues(
  row: RowData | null,
  names: string[]
): string[] {
  return names.map((name) => safeCellText(row ? row[name] : ""));
}

function buildSummarySheet(
  workbook: Workbook,
  result: ReconcileResult,
  options: ExportOptions & { generatedAt: Date }
): Worksheet {
  const worksheet = workbook.addWorksheet(REPORT_SHEET_NAMES.summary, {
    views: [{ state: "frozen", ySplit: 10 }],
  });

  worksheet.mergeCells("A1:C1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "BÁO CÁO ĐỐI SOÁT DỮ LIỆU · RECOSHEET";
  titleCell.font = { bold: true, size: 16, color: { argb: COLORS.title } };
  titleCell.alignment = { vertical: "middle" };
  worksheet.getRow(1).height = 28;

  const keyColumns = `${result.config.keyColumnA} ↔ ${result.config.keyColumnB}`;
  const valueColumns =
    result.config.valueColumnA && result.config.valueColumnB
      ? `${result.config.valueColumnA} ↔ ${result.config.valueColumnB}`
      : "Không so sánh giá trị (chỉ đối chiếu mã)";

  const metaRows: [string, string][] = [
    ["Thời điểm tạo báo cáo", formatDateTime(options.generatedAt)],
    ["Tệp A (Nguồn đối chiếu)", options.fileNameA ?? "—"],
    ["Tệp B (Nguồn so sánh)", options.fileNameB ?? "—"],
    ["Cột khóa", keyColumns],
    ["Cột giá trị", valueColumns],
    ["Dung sai cho phép", result.config.tolerance ? `±${formatTolerance(result.config.tolerance)}` : "0"],
    [
      "Làm sạch dữ liệu",
      `Tự cắt: ${result.config.autoTrim ? "Bật" : "Tắt"} · Hoa/thường: ${
        result.config.caseInsensitive ? "Bật" : "Tắt"
      } · Bỏ dấu: ${result.config.stripPunctuation ? "Bật" : "Tắt"}`,
    ],
    ["Thời gian xử lý", `${Math.round(options.elapsedMs ?? 0)} ms`],
  ];

  metaRows.forEach(([label, value], index) => {
    const rowNumber = index + 2;
    const labelCell = worksheet.getCell(rowNumber, 1);
    const valueCell = worksheet.getCell(rowNumber, 2);

    labelCell.value = label;
    labelCell.font = { bold: true, color: { argb: COLORS.muted } };
    valueCell.value = safeCellText(value);
    worksheet.mergeCells(rowNumber, 2, rowNumber, 3);
  });

  const tableHeaderRow = 11;
  worksheet.addRow([]);
  const header = worksheet.addRow(["Chỉ tiêu", "Số dòng", "Ghi chú"]);
  styleHeaderRow(worksheet, header.number);

  const summary = result.summary;
  const rows: [string, number | string, string][] = [
    ["Tổng số dòng tệp A", summary.totalA, "Bao gồm dòng bị bỏ qua"],
    ["Tổng số dòng tệp B", summary.totalB, "Bao gồm dòng bị bỏ qua"],
    ["Khớp hoàn toàn", summary.matched, "Mã và giá trị nằm trong dung sai"],
    ["Lệch giá trị", summary.discrepancy, "Cần kiểm tra lại"],
    ["Chỉ có ở tệp A", summary.onlyInA, "Thiếu ở tệp B"],
    ["Chỉ có ở tệp B", summary.onlyInB, "Thiếu ở tệp A"],
    ["Dòng bỏ qua (khóa trống)", summary.skippedA + summary.skippedB, "Không có mã định danh"],
    [
      "Tổng chênh lệch (B − A)",
      formatDelta(summary.totalDelta),
      "Chỉ tính các dòng lệch giá trị",
    ],
  ];

  rows.forEach((values, index) => {
    const row = worksheet.addRow(values);
    const rowNumber = tableHeaderRow + 1 + index;

    if (rowNumber % 2 === 0) {
      paintRow(worksheet, rowNumber, COLORS.zebra);
    }

    const countCell = worksheet.getCell(rowNumber, 2);
    countCell.alignment = { horizontal: "right" };

    if (values[0] === "Tổng chênh lệch (B − A)") {
      countCell.numFmt = AMOUNT_FORMAT;
      countCell.font = { bold: true, color: { argb: COLORS.discrepancyText } };
      row.font = { bold: true };
    }
  });

  const noteRow = tableHeaderRow + rows.length + 2;
  worksheet.mergeCells(noteRow, 1, noteRow, 3);
  const note = worksheet.getCell(noteRow, 1);
  note.value =
    "Báo cáo được tạo hoàn toàn trong trình duyệt của bạn. Không có dữ liệu nào được gửi lên máy chủ.";
  note.font = { italic: true, color: { argb: COLORS.muted } };

  worksheet.getColumn(1).width = 32;
  worksheet.getColumn(2).width = 18;
  worksheet.getColumn(3).width = 46;

  return worksheet;
}

function buildDiscrepancySheet(
  workbook: Workbook,
  result: ReconcileResult
): Worksheet {
  const headers = [
    "STT",
    "Mã khóa",
    "Mã gốc A",
    "Mã gốc B",
    "Dòng A",
    "Dòng B",
    "Giá trị A",
    "Giá trị B",
    "Chênh lệch (B − A)",
  ];

  const rows = result.discrepancy.map((record, index) => [
    index + 1,
    safeCellText(record.key),
    safeCellText(record.keyA ?? ""),
    safeCellText(record.keyB ?? ""),
    record.rowNumberA ?? "",
    record.rowNumberB ?? "",
    formatNumber(record.valueA),
    formatNumber(record.valueB),
    formatDelta(record.delta),
  ]);

  return writeDataSheet(workbook, REPORT_SHEET_NAMES.discrepancy, headers, rows, {
    rowColor: COLORS.discrepancy,
    amountColumns: [7, 8, 9],
    deltaColumn: 9,
    emptyMessage: "Không phát hiện dòng lệch giá trị.",
  });
}

function buildOnlyInSheet(
  workbook: Workbook,
  title: string,
  records: DiffRecord[],
  side: "A" | "B"
): Worksheet {
  const extraColumns = rawColumnNames(records, side);
  const headers = [
    "STT",
    "Mã khóa",
    "Mã gốc",
    "Dòng",
    "Giá trị",
    ...extraColumns.map((name) => `${side} · ${name}`),
  ];

  const rows = records.map((record, index) => {
    const raw = side === "A" ? record.rawA : record.rawB;
    const value = side === "A" ? record.valueA : record.valueB;
    const rowNumber = side === "A" ? record.rowNumberA : record.rowNumberB;
    const key = side === "A" ? record.keyA : record.keyB;

    return [
      index + 1,
      safeCellText(record.key),
      safeCellText(key ?? ""),
      rowNumber ?? "",
      formatNumber(value),
      ...rawValues(raw, extraColumns),
    ];
  });

  return writeDataSheet(
    workbook,
    title,
    headers,
    rows,
    {
      rowColor: side === "A" ? COLORS.onlyInA : COLORS.onlyInB,
      amountColumns: [5],
      emptyMessage:
        side === "A"
          ? "Mọi mã trong tệp A đều xuất hiện ở tệp B."
          : "Mọi mã trong tệp B đều xuất hiện ở tệp A.",
    }
  );
}

function buildMatchedSheet(
  workbook: Workbook,
  result: ReconcileResult
): Worksheet {
  const headers = [
    "STT",
    "Mã khóa",
    "Mã gốc A",
    "Mã gốc B",
    "Giá trị A",
    "Giá trị B",
    "Chênh lệch (B − A)",
    "Dòng A",
    "Dòng B",
  ];

  const rows = result.matched.map((record, index) => [
    index + 1,
    safeCellText(record.key),
    safeCellText(record.keyA ?? ""),
    safeCellText(record.keyB ?? ""),
    formatNumber(record.valueA),
    formatNumber(record.valueB),
    formatDelta(record.delta),
    record.rowNumberA ?? "",
    record.rowNumberB ?? "",
  ]);

  return writeDataSheet(workbook, REPORT_SHEET_NAMES.matched, headers, rows, {
    rowColor: COLORS.matched,
    amountColumns: [5, 6, 7],
    deltaColumn: 7,
    emptyMessage: "Không có dòng khớp hoàn toàn.",
  });
}

/** Build the complete 5-sheet report (summary + 4 result sheets). */
export async function buildReconciliationWorkbook(
  result: ReconcileResult,
  options: ExportOptions = {}
): Promise<Blob> {
  const excel = await loadExcelJs();
  const generatedAt = options.generatedAt ?? new Date();

  const workbook = new excel.Workbook();
  workbook.creator = "RecoSheet";
  workbook.lastModifiedBy = "RecoSheet";
  workbook.created = generatedAt;
  workbook.modified = generatedAt;

  buildSummarySheet(workbook, result, { ...options, generatedAt });
  buildDiscrepancySheet(workbook, result);
  buildOnlyInSheet(workbook, REPORT_SHEET_NAMES.onlyInA, result.onlyInA, "A");
  buildOnlyInSheet(workbook, REPORT_SHEET_NAMES.onlyInB, result.onlyInB, "B");
  buildMatchedSheet(workbook, result);

  const buffer = await workbook.xlsx.writeBuffer();
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer);

  return new Blob([bytes as unknown as BlobPart], { type: XLSX_MIME });
}

/** `Bao-cao-doi-soat-YYYY-MM-DD.xlsx` (ASCII-safe for every OS). */
export function buildExportFileName(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `Bao-cao-doi-soat-${year}-${month}-${day}.xlsx`;
}

/** Convenience wrapper used by the export hook. */
export async function createReconciliationReport(
  result: ReconcileResult,
  options: ExportOptions = {}
): Promise<{ blob: Blob; fileName: string }> {
  const generatedAt = options.generatedAt ?? new Date();
  const blob = await buildReconciliationWorkbook(result, {
    ...options,
    generatedAt,
  });

  return {
    blob,
    fileName: buildExportFileName(generatedAt),
  };
}

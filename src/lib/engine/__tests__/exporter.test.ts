import { Workbook } from "exceljs";
import { describe, expect, it } from "vitest";
import type { RowData } from "../../../types/spreadsheet";
import type { ReconcileConfig } from "../../../types/reconciliation";
import { buildExportFileName, buildReconciliationWorkbook, REPORT_SHEET_NAMES } from "../exporter";
import { reconcileRows } from "../matcher";

const CONFIG: ReconcileConfig = {
  keyColumnA: "Mã đơn",
  keyColumnB: "Mã đơn",
  valueColumnA: "Số tiền",
  valueColumnB: "Số tiền",
  tolerance: 0,
  autoTrim: true,
  caseInsensitive: true,
  stripPunctuation: false,
};

function row(key: string, amount: string): RowData {
  return { "Mã đơn": key, "Số tiền": amount };
}

const rowsA: RowData[] = [
  row("ORD-101", "1,000,000"),
  row("ORD-102", "500,000"),
  row("ORD-103", "250,000"),
];

const rowsB: RowData[] = [
  row("ord-101", "900,000"),
  row("ORD-102", "500,000"),
  row("ORD-104", "700,000"),
];

async function reopen(blob: Blob): Promise<Workbook> {
  const workbook = new Workbook();
  const buffer = Buffer.from(await blob.arrayBuffer());
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  return workbook;
}

describe("buildReconciliationWorkbook", () => {
  it("creates one summary sheet and four result sheets", async () => {
    const result = reconcileRows(rowsA, rowsB, CONFIG);
    const blob = await buildReconciliationWorkbook(result, {
      generatedAt: new Date("2026-10-28T08:00:00Z"),
      fileNameA: "so-quy.xlsx",
      fileNameB: "sao-ke.csv",
      elapsedMs: 42,
    });

    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(blob.size).toBeGreaterThan(1000);

    const workbook = await reopen(blob);

    expect(workbook.worksheets).toHaveLength(5);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      REPORT_SHEET_NAMES.summary,
      REPORT_SHEET_NAMES.discrepancy,
      REPORT_SHEET_NAMES.onlyInA,
      REPORT_SHEET_NAMES.onlyInB,
      REPORT_SHEET_NAMES.matched,
    ]);
  });

  it("styles the summary sheet and reports the final counts", async () => {
    const result = reconcileRows(rowsA, rowsB, CONFIG);
    const blob = await buildReconciliationWorkbook(result, {
      generatedAt: new Date("2026-10-28T08:00:00Z"),
    });
    const workbook = await reopen(blob);
    const summary = workbook.getWorksheet(REPORT_SHEET_NAMES.summary)!;

    expect(String(summary.getCell("A1").value)).toContain("RECOSHEET");
    expect(summary.getCell("A1").font?.bold).toBe(true);

    const labels = new Map<string, unknown>();
    summary.eachRow((row) => {
      labels.set(String(row.getCell(1).value), row.getCell(2).value);
    });

    expect(labels.get("Tổng số dòng tệp A")).toBe(3);
    expect(labels.get("Tổng số dòng tệp B")).toBe(3);
    expect(labels.get("Lệch giá trị")).toBe(1);
    expect(labels.get("Chỉ có ở tệp A")).toBe(1);
    expect(labels.get("Chỉ có ở tệp B")).toBe(1);
    expect(labels.get("Khớp hoàn toàn")).toBe(1);
  });

  it("highlights discrepancy rows and the delta cell", async () => {
    const result = reconcileRows(rowsA, rowsB, CONFIG);
    const blob = await buildReconciliationWorkbook(result);
    const workbook = await reopen(blob);
    const sheet = workbook.getWorksheet(REPORT_SHEET_NAMES.discrepancy)!;

    expect(String(sheet.getCell("B2").value)).toBe("ord-101");

    const rowFill = sheet.getCell("A2").fill as { fgColor?: { argb?: string } };
    expect(rowFill.fgColor?.argb).toBe("FFFFF2CC");

    const deltaCell = sheet.getCell("I2");
    expect(deltaCell.value).toBe(-100000);
    expect(deltaCell.font?.color?.argb).toBe("FFC00000");

    const headerFill = sheet.getCell("A1").fill as { fgColor?: { argb?: string } };
    expect(headerFill.fgColor?.argb).toBe("FF1F4E78");
  });

  it("lists the original raw columns for one-sided rows", async () => {
    const result = reconcileRows(rowsA, rowsB, CONFIG);
    const blob = await buildReconciliationWorkbook(result);
    const workbook = await reopen(blob);
    const sheet = workbook.getWorksheet(REPORT_SHEET_NAMES.onlyInB)!;

    expect(String(sheet.getCell("B2").value)).toBe("ord-104");
    expect(String(sheet.getCell("F1").value)).toContain("B ·");
    expect(String(sheet.getCell("F2").value)).toBe("ORD-104");
    expect(String(sheet.getCell("G2").value)).toBe("700,000");
  });

  it("neutralises formula injection in raw text columns", async () => {
    const injectionA: RowData[] = [{ "Mã đơn": "=CMD()", "Số tiền": "1" }];
    const result = reconcileRows(injectionA, [], CONFIG);
    const blob = await buildReconciliationWorkbook(result);
    const workbook = await reopen(blob);
    const sheet = workbook.getWorksheet(REPORT_SHEET_NAMES.onlyInA)!;

    expect(String(sheet.getCell("C2").value)).toBe("'=CMD()");
  });

  it("still creates all five sheets when there is no data", async () => {
    const empty = reconcileRows([], [], CONFIG);
    const blob = await buildReconciliationWorkbook(empty, {
      generatedAt: new Date("2026-10-28T08:00:00Z"),
    });
    const workbook = await reopen(blob);

    expect(workbook.worksheets).toHaveLength(5);
    expect(
      String(
        workbook
          .getWorksheet(REPORT_SHEET_NAMES.discrepancy)!
          .getCell("A2").value
      )
    ).toBe("Không phát hiện dòng lệch giá trị.");
    expect(
      String(
        workbook.getWorksheet(REPORT_SHEET_NAMES.matched)!.getCell("A2").value
      )
    ).toBe("Không có dòng khớp hoàn toàn.");
  });
});

describe("buildExportFileName", () => {
  it("creates a safe, dated filename", () => {
    expect(buildExportFileName(new Date(2026, 9, 28))).toBe(
      "Bao-cao-doi-soat-2026-10-28.xlsx"
    );
  });
});

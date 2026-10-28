import { readFile } from "node:fs/promises";
import path from "node:path";
import { Workbook } from "exceljs";
import { describe, expect, it } from "vitest";
import { buildReconciliationWorkbook, REPORT_SHEET_NAMES } from "@/lib/engine/exporter";
import { reconcileRows } from "@/lib/engine/matcher";
import { parseSpreadsheetFile } from "@/lib/engine/parser";
import type { ReconcileConfig } from "@/types/reconciliation";

const SAMPLE_DIRECTORY = path.join(process.cwd(), "public", "sample-data");

async function sampleFile(name: string, type: string): Promise<File> {
  const buffer = await readFile(path.join(SAMPLE_DIRECTORY, name));
  return new File([new Uint8Array(buffer)], name, { type });
}

const CONFIG: ReconcileConfig = {
  keyColumnA: "Mã đơn",
  keyColumnB: "Mã giao dịch",
  valueColumnA: "Số tiền",
  valueColumnB: "Số tiền",
  tolerance: 0,
  autoTrim: true,
  caseInsensitive: true,
  stripPunctuation: false,
};

async function loadSampleSheets() {
  const [sheetA, sheetB] = await Promise.all([
    sampleFile(
      "sample_internal_ledger.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ).then(parseSpreadsheetFile),
    sampleFile("sample_bank_statement.csv", "text/csv").then(parseSpreadsheetFile),
  ]);

  return { sheetA, sheetB };
}

describe("Release acceptance · AC-01 → AC-05", () => {
  it("AC-01: parses the .xlsx and .csv samples in under 2 seconds and exposes their columns", async () => {
    const startedAt = performance.now();
    const { sheetA, sheetB } = await loadSampleSheets();
    const elapsedMs = performance.now() - startedAt;

    expect(elapsedMs).toBeLessThan(2000);
    expect(sheetA.columns.map((column) => column.name)).toEqual([
      "Mã đơn",
      "Khách hàng",
      "Số tiền",
      "Ngày ghi nhận",
      "Ghi chú",
    ]);
    expect(sheetB.columns.map((column) => column.name)).toEqual([
      "Mã giao dịch",
      "Số tiền",
      "Ngày",
      "Diễn giải",
    ]);
    expect(sheetA.rowCount).toBe(12);
    expect(sheetB.rowCount).toBe(12);
  });

  it("AC-02/03/04: normalizes dirty keys, computes exact delta and splits missing rows", async () => {
    const { sheetA, sheetB } = await loadSampleSheets();
    const result = reconcileRows(sheetA.rows, sheetB.rows, CONFIG);

    // AC-02: " ORD-101 " must match "ord-101" with Auto-Trim + case-insensitive.
    const pairedRecord = [...result.matched, ...result.discrepancy].find(
      (record) => record.key === "ord-101"
    );
    expect(pairedRecord).toBeDefined();
    expect(pairedRecord?.keyA).toBe(" ORD-101 ");
    expect(pairedRecord?.keyB).toBe("ord-101");

    // AC-03: 1,000,000 vs 900,000 => Δ = -100,000 (big.js, no float error).
    const discrepancy = result.discrepancy.find(
      (record) => record.key === "ord-101"
    );
    expect(discrepancy?.status).toBe("discrepancy");
    expect(discrepancy?.delta).toBe("-100000");
    expect(discrepancy?.valueA).toBe(1000000);
    expect(discrepancy?.valueB).toBe(900000);

    // AC-04: rows present in only one file are separated.
    expect(result.onlyInA.map((record) => record.key)).toEqual([
      "ord-107",
      "ord-111",
    ]);
    expect(result.onlyInB.map((record) => record.key)).toEqual([
      "ord-113",
      "ord-114",
    ]);
    expect(result.summary).toMatchObject({
      matched: 8,
      discrepancy: 2,
      onlyInA: 2,
      onlyInB: 2,
      totalDelta: "-95000",
    });
  });

  it("AC-05: exports one summary + four result sheets with orange discrepancy rows and reopens cleanly", async () => {
    const { sheetA, sheetB } = await loadSampleSheets();
    const result = reconcileRows(sheetA.rows, sheetB.rows, CONFIG);
    const blob = await buildReconciliationWorkbook(result, {
      generatedAt: new Date("2026-10-28T12:00:00Z"),
      fileNameA: "sample_internal_ledger.xlsx",
      fileNameB: "sample_bank_statement.csv",
      elapsedMs: 12,
    });

    const workbook = new Workbook();
    await workbook.xlsx.load(
      Buffer.from(await blob.arrayBuffer()) as unknown as ArrayBuffer
    );

    expect(workbook.worksheets).toHaveLength(5);
    expect(workbook.worksheets[0]?.name).toBe(REPORT_SHEET_NAMES.summary);

    const resultSheetNames = workbook.worksheets
      .slice(1)
      .map((worksheet) => worksheet.name);
    expect(resultSheetNames).toEqual([
      REPORT_SHEET_NAMES.discrepancy,
      REPORT_SHEET_NAMES.onlyInA,
      REPORT_SHEET_NAMES.onlyInB,
      REPORT_SHEET_NAMES.matched,
    ]);

    const discrepancySheet = workbook.getWorksheet(
      REPORT_SHEET_NAMES.discrepancy
    )!;
    const rowFill = discrepancySheet.getCell("A2").fill as {
      fgColor?: { argb?: string };
    };
    const deltaCell = discrepancySheet.getCell("I2");

    expect(rowFill.fgColor?.argb).toBe("FFFFF2CC");
    expect(deltaCell.value).toBe(-100000);
    expect(deltaCell.font?.color?.argb).toBe("FFC00000");
  });
});

import { Workbook } from "exceljs";
import { describe, expect, it } from "vitest";
import { SpreadsheetParseError } from "../../../types/spreadsheet";
import { parseSpreadsheetFile } from "../parser";

function csv(content: string, name = "statement.csv"): File {
  return new File([content], name, { type: "text/csv" });
}

async function workbookFile(
  build: (workbook: Workbook) => void,
  name = "ledger.xlsx"
): Promise<File> {
  const workbook = new Workbook();
  build(workbook);
  const buffer = await workbook.xlsx.writeBuffer();
  return new File([new Uint8Array(buffer as ArrayBuffer)], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

async function expectParseError(
  promise: Promise<unknown>,
  code: SpreadsheetParseError["code"]
): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(SpreadsheetParseError);

  try {
    await promise;
  } catch (error) {
    expect((error as SpreadsheetParseError).code).toBe(code);
  }
}

describe("parseSpreadsheetFile · CSV", () => {
  it("parses headers, rows and the five-row preview", async () => {
    const rows = Array.from(
      { length: 8 },
      (_, index) => `ORD-${index + 1},${(index + 1) * 1000}`
    );
    const file = csv(`Mã đơn,Số tiền\n${rows.join("\n")}`);

    const sheet = await parseSpreadsheetFile(file);

    expect(sheet.fileName).toBe("statement.csv");
    expect(sheet.columns.map((column) => column.name)).toEqual([
      "Mã đơn",
      "Số tiền",
    ]);
    expect(sheet.rowCount).toBe(8);
    expect(sheet.preview).toHaveLength(5);
    expect(sheet.rows[0]).toEqual({ "Mã đơn": "ORD-1", "Số tiền": "1000" });
    expect(sheet.sheetName).toBe("statement.csv");
  });

  it("strips a UTF-8 BOM from the first header", async () => {
    const sheet = await parseSpreadsheetFile(csv("\uFEFFMã đơn,Số tiền\nORD-1,1000"));

    expect(sheet.columns[0]?.name).toBe("Mã đơn");
  });

  it("auto-detects a semicolon delimiter", async () => {
    const sheet = await parseSpreadsheetFile(
      csv("Mã đơn;Số tiền\nORD-1;1000\nORD-2;2000")
    );

    expect(sheet.columns.map((column) => column.name)).toEqual([
      "Mã đơn",
      "Số tiền",
    ]);
    expect(sheet.rowCount).toBe(2);
  });

  it("de-duplicates repeated header names", async () => {
    const sheet = await parseSpreadsheetFile(csv("Mã,Mã\n1,2"));

    expect(sheet.columns.map((column) => column.name)).toEqual([
      "Mã",
      "Mã (2)",
    ]);
  });

  it("generates a fallback name for an empty header cell", async () => {
    const sheet = await parseSpreadsheetFile(csv("Mã,,Số tiền\nA,x,10"));

    expect(sheet.columns.map((column) => column.name)).toEqual([
      "Mã",
      "Cột 2",
      "Số tiền",
    ]);
  });

  it("ignores empty lines", async () => {
    const sheet = await parseSpreadsheetFile(
      csv("Mã,Số tiền\n\nA,10\n\nB,20\n")
    );

    expect(sheet.rowCount).toBe(2);
  });

  it("rejects an empty file", async () => {
    await expectParseError(parseSpreadsheetFile(csv("   ")), "EMPTY_FILE");
  });

  it("rejects a header without data rows", async () => {
    await expectParseError(
      parseSpreadsheetFile(csv("Mã đơn,Số tiền\n")),
      "NO_ROWS"
    );
  });
});

describe("parseSpreadsheetFile · XLSX", () => {
  it("reads the first sheet with header row and values", async () => {
    const file = await workbookFile((workbook) => {
      const sheet = workbook.addWorksheet("Sao kê ngân hàng");
      sheet.addRow(["Mã đơn", "Số tiền", "Ngày"]);
      sheet.addRow([" ORD-101 ", 1000000, new Date("2026-10-01")]);
      sheet.addRow(["ORD-102", 900000, new Date("2026-10-02")]);

      const second = workbook.addWorksheet("Bỏ qua");
      second.addRow(["Khác"]);
      second.addRow(["x"]);
    });

    const sheet = await parseSpreadsheetFile(file);

    expect(sheet.sheetName).toBe("Sao kê ngân hàng");
    expect(sheet.columns.map((column) => column.name)).toEqual([
      "Mã đơn",
      "Số tiền",
      "Ngày",
    ]);
    expect(sheet.rowCount).toBe(2);
    expect(sheet.rows[0]?.["Mã đơn"]).toBe(" ORD-101 ");
    expect(sheet.rows[0]?.["Số tiền"]).toBe("1000000");
    expect(String(sheet.rows[0]?.["Ngày"])).toContain("2026");
  });

  it("skips leading empty rows before the header", async () => {
    const file = await workbookFile((workbook) => {
      const sheet = workbook.addWorksheet("Data");
      sheet.addRow([]);
      sheet.addRow([]);
      sheet.addRow(["Mã đơn", "Số tiền"]);
      sheet.addRow(["ORD-1", 1000]);
    });

    const sheet = await parseSpreadsheetFile(file);

    expect(sheet.rowCount).toBe(1);
    expect(sheet.rows[0]).toEqual({ "Mã đơn": "ORD-1", "Số tiền": "1000" });
  });

  it("rejects a corrupt xlsx file", async () => {
    const fake = new File(
      [new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])],
      "broken.xlsx"
    );

    await expectParseError(parseSpreadsheetFile(fake), "INVALID_FILE");
  });

  it("rejects files that are not really xlsx", async () => {
    const fake = new File([new Uint8Array([1, 2, 3, 4])], "renamed.xlsx");

    await expectParseError(parseSpreadsheetFile(fake), "INVALID_FILE");
  });

  it("explains that legacy .xls files are not supported", async () => {
    const legacy = new File(
      [
        new Uint8Array([
          0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00,
        ]),
      ],
      "ledger.xls"
    );

    await expectParseError(
      parseSpreadsheetFile(legacy),
      "LEGACY_XLS_UNSUPPORTED"
    );
  });
});

describe("parseSpreadsheetFile · validation", () => {
  it("rejects unsupported extensions", async () => {
    await expectParseError(
      parseSpreadsheetFile(new File(["hello"], "notes.txt")),
      "UNSUPPORTED_FORMAT"
    );
  });

  it("rejects empty files", async () => {
    await expectParseError(
      parseSpreadsheetFile(new File([], "empty.csv")),
      "EMPTY_FILE"
    );
  });

  it("rejects files above the 10MB limit", async () => {
    const oversized = new File(["Mã\n"], "huge.csv");
    Object.defineProperty(oversized, "size", { value: 11 * 1024 * 1024 });

    await expectParseError(parseSpreadsheetFile(oversized), "FILE_TOO_LARGE");
  });
});

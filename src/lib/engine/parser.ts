/**
 * Spreadsheet parser (ExcelJS + PapaParse).
 *
 * Runs entirely in memory: the file is read with `arrayBuffer()` and never
 * leaves the browser. The module has no React/Next.js dependency.
 */

import Papa from "papaparse";
import {
  MAX_FILE_SIZE_BYTES,
  PREVIEW_ROW_COUNT,
  SpreadsheetParseError,
  type CellValue,
  type ColumnSchema,
  type ParsedSheet,
  type RowData,
  type SpreadsheetFileLike,
} from "../../types/spreadsheet";

const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04] as const;
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] as const;

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every((byte, index) => bytes[index] === byte);
}

function extensionOf(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

export function isSupportedSpreadsheetFile(fileName: string): boolean {
  return [".xlsx", ".xls", ".csv"].includes(extensionOf(fileName));
}

function decodeText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes);
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes);
  }

  return new TextDecoder("utf-8").decode(bytes);
}

/** Build unique, trimmed column names from a raw header row. */
function buildColumns(rawHeaders: string[]): ColumnSchema[] {
  const cleaned = rawHeaders.map((header) =>
    header.replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim()
  );

  let lastIndex = cleaned.length - 1;
  while (lastIndex >= 0 && cleaned[lastIndex] === "") {
    lastIndex -= 1;
  }

  if (lastIndex < 0) {
    return [];
  }

  const used = new Map<string, number>();
  const columns: ColumnSchema[] = [];

  for (let index = 0; index <= lastIndex; index += 1) {
    const fallback = `Cột ${index + 1}`;
    const baseName = cleaned[index] || fallback;
    const seen = (used.get(baseName) ?? 0) + 1;
    used.set(baseName, seen);

    columns.push({
      name: seen > 1 ? `${baseName} (${seen})` : baseName,
      index,
    });
  }

  return columns;
}

function isRowEmpty(cells: CellValue[]): boolean {
  return cells.every((cell) => {
    if (cell === null || cell === undefined) {
      return true;
    }
    return String(cell).trim() === "";
  });
}

function toRowData(columns: ColumnSchema[], cells: CellValue[]): RowData {
  const row: RowData = {};
  for (const column of columns) {
    const value = cells[column.index];
    row[column.name] = value ?? "";
  }
  return row;
}

function finaliseSheet(
  fileName: string,
  fileSize: number,
  sheetName: string,
  columns: ColumnSchema[],
  rows: RowData[]
): ParsedSheet {
  if (rows.length === 0) {
    throw new SpreadsheetParseError(
      "NO_ROWS",
      "Tệp không có dòng dữ liệu nào bên dưới dòng tiêu đề."
    );
  }

  return {
    fileName,
    fileSize,
    sheetName,
    columns,
    rows,
    preview: rows.slice(0, PREVIEW_ROW_COUNT),
    rowCount: rows.length,
  };
}

function parseCsv(
  buffer: ArrayBuffer,
  fileName: string,
  fileSize: number
): ParsedSheet {
  const text = decodeText(buffer);

  if (!text.trim()) {
    throw new SpreadsheetParseError("EMPTY_FILE", "Tệp CSV rỗng.");
  }

  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });

  const rawRows = result.data.filter(
    (row) => Array.isArray(row) && !isRowEmpty(row)
  );

  if (rawRows.length === 0) {
    throw new SpreadsheetParseError(
      "EMPTY_FILE",
      "Không đọc được dòng dữ liệu nào từ tệp CSV."
    );
  }

  if (result.errors.length > 0 && rawRows.length <= 1) {
    throw new SpreadsheetParseError(
      "INVALID_CSV",
      "Tệp CSV bị lỗi định dạng hoặc không có dữ liệu.",
      { cause: result.errors[0] }
    );
  }

  const columns = buildColumns((rawRows[0] ?? []).map(String));

  if (columns.length === 0) {
    throw new SpreadsheetParseError(
      "NO_HEADER",
      "Không tìm thấy dòng tiêu đề hợp lệ trong tệp CSV."
    );
  }

  const rows = rawRows
    .slice(1)
    .filter((row) => !isRowEmpty(row))
    .map((row) => toRowData(columns, row.map((cell) => cell ?? "")));

  return finaliseSheet(fileName, fileSize, fileName, columns, rows);
}

async function parseXlsx(
  buffer: ArrayBuffer,
  fileName: string,
  fileSize: number
): Promise<ParsedSheet> {
  type ExcelModule = typeof import("exceljs");

  let excel: ExcelModule;

  try {
    const imported = (await import("exceljs")) as ExcelModule & {
      default?: ExcelModule;
    };
    excel = imported.default?.Workbook ? imported.default : imported;
  } catch (error) {
    throw new SpreadsheetParseError(
      "PARSE_FAILED",
      "Không thể khởi tạo bộ đọc Excel trong trình duyệt.",
      { cause: error }
    );
  }

  const workbook = new excel.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch (error) {
    throw new SpreadsheetParseError(
      "INVALID_FILE",
      "Tệp Excel bị hỏng hoặc không đúng định dạng .xlsx.",
      { cause: error }
    );
  }

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new SpreadsheetParseError(
      "EMPTY_FILE",
      "Tệp Excel không có sheet nào."
    );
  }

  const maxRow = worksheet.rowCount;
  const maxColumn = worksheet.columnCount;

  let headerRowNumber = -1;
  const headerCells: string[] = [];

  for (let rowNumber = 1; rowNumber <= Math.min(maxRow, 20); rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const cells: string[] = [];

    for (let column = 1; column <= maxColumn; column += 1) {
      const cell = row.getCell(column);
      cells.push(cell.text ?? "");
    }

    if (!isRowEmpty(cells)) {
      headerRowNumber = rowNumber;
      headerCells.push(...cells);
      break;
    }
  }

  if (headerRowNumber < 0) {
    throw new SpreadsheetParseError(
      "NO_HEADER",
      "Không tìm thấy dòng tiêu đề hợp lệ trong tệp Excel."
    );
  }

  const columns = buildColumns(headerCells);

  if (columns.length === 0) {
    throw new SpreadsheetParseError(
      "NO_HEADER",
      "Dòng tiêu đề của tệp Excel không có tên cột."
    );
  }

  const rows: RowData[] = [];

  for (let rowNumber = headerRowNumber + 1; rowNumber <= maxRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const cells: CellValue[] = [];

    for (let column = 1; column <= columns.length; column += 1) {
      const cell = row.getCell(column);
      cells.push(cell.text ?? "");
    }

    if (isRowEmpty(cells)) {
      continue;
    }

    rows.push(toRowData(columns, cells));
  }

  return finaliseSheet(fileName, fileSize, worksheet.name, columns, rows);
}

/**
 * Parse a spreadsheet file. Only the first sheet is read.
 * Throws `SpreadsheetParseError` with a stable `code` for the UI layer.
 */
export async function parseSpreadsheetFile(
  file: SpreadsheetFileLike
): Promise<ParsedSheet> {
  const extension = extensionOf(file.name);

  if (!isSupportedSpreadsheetFile(file.name)) {
    throw new SpreadsheetParseError(
      "UNSUPPORTED_FORMAT",
      "Chỉ hỗ trợ tệp .xlsx, .xls hoặc .csv."
    );
  }

  if (file.size !== undefined && file.size > MAX_FILE_SIZE_BYTES) {
    throw new SpreadsheetParseError(
      "FILE_TOO_LARGE",
      "Tệp vượt quá giới hạn 10MB. Vui lòng chia nhỏ dữ liệu."
    );
  }

  let buffer: ArrayBuffer;

  try {
    buffer = await file.arrayBuffer();
  } catch (error) {
    throw new SpreadsheetParseError(
      "INVALID_FILE",
      "Không thể đọc nội dung tệp từ bộ nhớ trình duyệt.",
      { cause: error }
    );
  }

  if (buffer.byteLength === 0) {
    throw new SpreadsheetParseError("EMPTY_FILE", "Tệp rỗng.");
  }

  const bytes = new Uint8Array(buffer);

  if (startsWith(bytes, OLE_SIGNATURE)) {
    throw new SpreadsheetParseError(
      "LEGACY_XLS_UNSUPPORTED",
      "Tệp .xls (Excel 97-2003) chưa được hỗ trợ. Vui lòng mở bằng Excel và lưu lại dưới định dạng .xlsx."
    );
  }

  const fileSize = file.size ?? buffer.byteLength;

  if (extension === ".csv") {
    return parseCsv(buffer, file.name, fileSize);
  }

  if (!startsWith(bytes, ZIP_SIGNATURE)) {
    throw new SpreadsheetParseError(
      "INVALID_FILE",
      "Tệp không phải là bảng tính Excel hợp lệ. Hãy kiểm tra lại phần mở rộng tệp."
    );
  }

  return parseXlsx(buffer, file.name, fileSize);
}

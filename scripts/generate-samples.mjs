/**
 * Generates the demo files served from /public/sample-data.
 * Run with: npm run samples
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";

const outputDirectory = path.join(process.cwd(), "public", "sample-data");

const ledgerRows = [
  [" ORD-101 ", "Công ty Minh Anh", 1000000, "2026-10-01", "Thu tiền đơn hàng"],
  ["ORD-102", "Cửa hàng Hòa Bình", 250000, "2026-10-02", "Thanh toán một phần"],
  ["ORD-103", "Công ty Đông Á", 500000, "2026-10-03", "Chuyển khoản"],
  ["ORD-104", "Nhà sách Trí Tuệ", 120000, "2026-10-04", "Thu hộ COD"],
  ["ORD-105", "Công ty Sao Mai", 99000, "2026-10-05", "Phí vận chuyển"],
  ["ORD-106", "Cửa hàng An Nhiên", 450000, "2026-10-06", "Đơn hàng bán buôn"],
  ["ORD-107", "Công ty Hải Đăng", 300000, "2026-10-07", "Chưa thấy tiền về"],
  ["ORD-108", "Nhà phân phối Nam Việt", 150000, "2026-10-08", "Thu tiền mặt"],
  ["ORD-109", "Công ty Tân Phú", 80000, "2026-10-09", "Thu hộ"],
  ["ORD-110", "Cửa hàng Bình Minh", 70000, "2026-10-10", "Đơn lẻ"],
  ["ORD-111", "Công ty Phương Nam", 200000, "2026-10-11", "Chờ đối chiếu"],
  ["ORD-112", "Nhà sách Hồng Ân", 120000, "2026-10-12", "Thu hộ COD"],
];

const statementRows = [
  ["ord-101", 900000, "2026-10-01", "GHN chuyển tiền"],
  ["ORD-102", 250000, "2026-10-02", "GHN chuyển tiền"],
  ["ORD-103", 500000, "2026-10-03", "Viettel Post"],
  ["ORD-104", 125000, "2026-10-04", "Đối tác trả thiếu phí"],
  ["ORD-105", 99000, "2026-10-05", "Phí vận chuyển"],
  ["ORD-106", 450000, "2026-10-06", "Chuyển khoản"],
  ["ORD-108", 150000, "2026-10-08", "Tiền mặt"],
  ["ORD-109", 80000, "2026-10-09", "Ví điện tử"],
  ["ORD-110", 70000, "2026-10-10", "Ví điện tử"],
  ["ORD-112", 120000, "2026-10-12", "GHN chuyển tiền"],
  ["ORD-113", 66000, "2026-10-13", "Không có trong sổ quỹ"],
  ["ORD-114", 77000, "2026-10-14", "Không có trong sổ quỹ"],
];

function csvCell(value) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RecoSheet";

  const sheet = workbook.addWorksheet("So quy 2026-10");
  sheet.addRow(["Mã đơn", "Khách hàng", "Số tiền", "Ngày ghi nhận", "Ghi chú"]);
  for (const row of ledgerRows) {
    sheet.addRow(row);
  }

  sheet.getRow(1).font = { bold: true };
  sheet.columns = [
    { width: 16 },
    { width: 28 },
    { width: 16, style: { numFmt: "#,##0" } },
    { width: 18 },
    { width: 30 },
  ];

  await workbook.xlsx.writeFile(
    path.join(outputDirectory, "sample_internal_ledger.xlsx")
  );

  const csvLines = [
    ["Mã giao dịch", "Số tiền", "Ngày", "Diễn giải"].map(csvCell).join(","),
    ...statementRows.map((row) => row.map(csvCell).join(",")),
  ];

  await writeFile(
    path.join(outputDirectory, "sample_bank_statement.csv"),
    `\uFEFF${csvLines.join("\n")}\n`,
    "utf8"
  );

  console.log("Sample data written to public/sample-data");
}

await main();

# BẢN THIẾT KẾ DỰ ÁN TỔNG THỂ (PROJECT-BLUEPRINT.md)
## Dự án: Smart Sheet Reconciler (RecoSheet)
**Phiên bản:** Master Blueprint 1.0  
**Định dạng sản phẩm:** Client-Side Web Application (Single-Page App)  
**Công nghệ nền tảng:** Next.js 14/15 App Router + TypeScript + Tailwind CSS + shadcn/ui + ExcelJS  
**Mục tiêu cốt lõi:** Tài liệu nguồn duy nhất (Single Source of Truth) hợp nhất toàn bộ yêu cầu sản phẩm, công nghệ, kiến trúc và tiêu chuẩn nghiệm thu phục vụ Vibe Coding nhanh và chính xác.

---

## 1. Tổng quan dự án & Vấn đề giải quyết

### 1.1 Tuyên ngôn sứ mệnh (Product Mission)
Xây dựng một công cụ web tức thì (zero-install, zero-login), cho phép người dùng kéo thả 2 bảng tính bất kỳ (Excel/CSV) để tự động làm sạch dữ liệu bẩn (khoảng trắng thừa, ký tự lệch) và đối soát chênh lệch về mã định danh hoặc số tiền trong vòng 1–2 giây với cam kết bảo mật tuyệt đối: **100% dữ liệu xử lý trong bộ nhớ RAM trình duyệt của người dùng (Zero-Server Storage)**.

### 1.2 Chân dung người dùng mục tiêu (Target Personas)
* **Kế toán thanh toán & Đối soát công nợ**: Đối chiếu sao kê ngân hàng với sổ quỹ nội bộ; loại bỏ triệt để lỗi `#N/A` của `VLOOKUP`/`XLOOKUP` do lỗi khoảng trắng ẩn hoặc định dạng Text/Number lẫn lộn.
* **Chuyên viên vận hành sàn TMĐT / Bán hàng**: Đối soát báo cáo tiền về từ các đơn vị vận chuyển (GHN, Viettel Post, Shopee) với danh sách đơn xuất kho để tìm ra đơn bị trừ sai phí.
* **Điều vận & Chứng từ Logistics / XNK**: So khớp danh sách số container, số seal, phí cước lưu kho/bãi giữa hãng tàu và bảng kê nội bộ.

---

## 2. Luồng trải nghiệm người dùng (End-to-End Workflow)

```
[BƯỚC 1: TẢI TỆP] ───> [BƯỚC 2: CẤU HÌNH] ───> [BƯỚC 3: ĐỐI SOÁT] ───> [BƯỚC 4: KẾT QUẢ & XUẤT]
- Kéo thả Tệp A & B    - Chọn Cột Khóa chính   - Auto-Trim chuỗi ngầm    - Thống kê 4 khối KPI
- Đọc nội bộ bằng RAM  - Chọn Cột Giá trị      - Hash Map khớp O(N+M)   - Bảng lọc phân loại
- Xem trước 5 dòng     - Cài dung sai ±X       - Tính Delta bằng big.js  - Tải Excel 4 sheet tô màu
```

1. **Bước 1 (Upload)**: Kéo thả 2 file (`.xlsx`, `.xls`, `.csv`) vào 2 khung Dropzone; trình duyệt đọc file ngay tại client và hiển thị 5 dòng xem trước kèm tổng số dòng/cột.
2. **Bước 2 (Mapping)**: Chọn Cột định danh (Key Column) và Cột giá trị (Value Column) ở mỗi file. Bật/tắt chế độ tự làm sạch chuỗi (Auto-Trim) và thiết lập ngưỡng dung sai số học (Tolerance).
3. **Bước 3 (Reconcile)**: Bấm nút "Bắt đầu đối soát". Thuật toán chạy ngầm trong 1–2 giây, bóc tách và phân loại dữ liệu tức thì.
4. **Bước 4 (Review & Export)**: Xem Dashboard tổng quan với 4 nhóm kết quả; lọc tìm kiếm mã đơn; tải về tệp báo cáo Excel hoàn chỉnh gồm 4 sheet có tô màu cảnh báo.

---

## 3. Phân ranh giới phạm vi (Scope & MVP Boundaries)

### 3.1 Phạm vi MVP (Xây dựng ngay đợt 1)
* [x] Hỗ trợ tải 2 tệp định dạng `.xlsx`, `.xls`, `.csv` (đọc sheet đầu tiên).
* [x] Chọn 1 cột khóa chính (Single Key) và 1 cột giá trị số đối chiếu.
* [x] Bộ làm sạch thông minh: Tự động cắt khoảng trắng ẩn (`TRIM`), chuẩn hóa không phân biệt hoa/thường, bóc tách số tiền có dấu phẩy/chấm.
* [x] Dashboard thống kê 4 nhóm: Khớp 100%, Lệch giá trị (kèm $\Delta$), Chỉ có ở Tệp A, Chỉ có ở Tệp B.
* [x] Bảng dữ liệu tương tác có ô tìm kiếm mã đơn và highlight màu cam/đỏ dòng lệch.
* [x] Xuất tệp báo cáo Excel 4 sheet định dạng chuẩn bằng ExcelJS.
* [x] 100% Client-Side execution, zero server upload.

### 3.2 Hạng mục trì hoãn (Deferred - Phase 2 & 3)
* [ ] Ghép nhiều cột thành khóa phức hợp (Composite Key, vd: `Ngày` + `Mã đơn`).
* [ ] Thuật toán so khớp mờ (Fuzzy String Matching) cho tên công ty viết tắt.
* [ ] Xử lý quan hệ 1-Nhiều (1 mã hóa đơn thanh toán thành nhiều đợt).
* [ ] Lưu cấu hình cột vào `localStorage` của trình duyệt.
* [ ] Xử lý tệp siêu lớn (>200.000 dòng) bằng Web Worker hoặc DuckDB-WASM.

---

## 4. Kiến trúc công nghệ & Thẩm định thư viện (Tech Stack)

### 4.1 Nền tảng cốt lõi
* **Framework**: **Next.js 14/15 (App Router)** với TypeScript.
* **Mô hình thực thi**: **Client-First (`'use client'`)**. Toàn bộ logic chạy trên trình duyệt người dùng để bảo mật tuyệt đối dữ liệu tài chính.
* **Giao diện & Styling**: **Tailwind CSS** + **shadcn/ui** (Radix UI primitives) + **Lucide React**.

### 4.2 Thư viện chuyên dụng đã thẩm định
* **`exceljs` (^4.4.0 - MIT License)**: Đọc `.xlsx` và tạo báo cáo Excel đa sheet có tô màu nền, in đậm tiêu đề. Khắc phục hạn chế của bản SheetJS miễn phí (vốn bị khóa tính năng format màu).
* **`papaparse` (^5.7.0 - MIT License)**: Xử lý tệp `.csv` với khả năng tự động dò dấu phân cách và tốc độ parse nhanh.
* **`big.js` (^6.2.2 - MIT License)**: Thực hiện phép tính số học chính xác tuyệt đối ($\Delta = B - A$), loại bỏ hoàn toàn lỗi floating-point của JavaScript.
* **`file-saver` (^2.0.5 - MIT License)**: Kích hoạt tải tệp Blob an toàn trên trình duyệt.

### 4.3 Lưu ý kỹ thuật Next.js (Tránh lỗi SSR Hydration)
* Import động `exceljs` bên trong hàm tải tệp (`await import('exceljs')`) để tránh lỗi `window is not defined`.
* Bổ sung Webpack fallbacks trong `next.config.mjs` (`fs: false`, `path: false`, `crypto: false`).

---

## 5. Kiến trúc hệ thống & Ranh giới Module (Architecture)

Hệ thống tuân thủ mô hình **Clean Client-Side Architecture** với nguyên tắc phụ thuộc một chiều nghiêm ngặt:
$$\text{UI Layer} \longrightarrow \text{Hooks / State Layer} \longrightarrow \text{Core Engine Layer} \longrightarrow \text{Domain Types}$$

```
reconciler-app/
├── PRESENTATION LAYER (UI)
│   ├── app/page.tsx               # Orchestrator trang chính điều phối 4 bước
│   ├── components/upload/         # DropzoneArea, FileCard, PreviewDataModal
│   ├── components/mapping/        # ColumnSelector, ToleranceInput, CleanToggle
│   ├── components/dashboard/      # SummaryCards, DiscrepancyBadge
│   └── components/results/        # ResultTabs, DiffTable, ExportButton
├── COORDINATION LAYER (Hooks)
│   ├── hooks/useFileUpload.ts     # Quản lý đọc tệp vào RAM
│   ├── hooks/useReconciler.ts     # Điều phối dữ liệu, chạy matcher, bắt lỗi
│   └── hooks/useExportExcel.ts    # Kích hoạt xuất tệp Blob ExcelJS
├── CORE ENGINE LAYER (Pure TS)
│   ├── lib/engine/parser.ts       # Đọc .xlsx và .csv ra mảng JSON
│   ├── lib/engine/normalizer.ts   # Cắt khoảng trắng, chuẩn hóa số âm, parse float
│   ├── lib/engine/matcher.ts      # Hash Map 1-1, so khớp O(N+M), tính delta
│   └── lib/engine/exporter.ts     # Dựng workbook ExcelJS 4 sheet có highlight
└── DOMAIN CONTRACTS (Types)
    ├── types/spreadsheet.ts       # Định nghĩa RawRow, ColumnHeader, SheetData
    └── types/reconciliation.ts    # Định nghĩa MatchStatus, DiffRecord, Summary
```

**Quy tắc vàng khi Vibe Coding**: Toàn bộ thư mục `src/lib/engine/` là các **Pure Functions độc lập**, tuyệt đối không chứa React Hooks hay JSX. Engine có thể chạy độc lập trong môi trường kiểm thử Vitest hoặc CLI mà không phụ thuộc vào Next.js.

---

## 6. Sơ đồ cấu trúc thư mục đề xuất (Directory Overview)

Theo định hướng tinh gọn ban đầu, đây là cấu trúc các thư mục chính cần thiết lập:

```text
reconciler-app/
├── docs/                      # Nơi lưu trữ tài liệu đặc tả (PRD, Tech Stack, Blueprint)
├── public/                    # Tài nguyên tĩnh và file dữ liệu mẫu test nhanh
├── src/
│   ├── app/                   # Routing, layout và trang chính Next.js
│   ├── components/            # UI components chia theo từng bước luồng người dùng
│   │   ├── ui/                # Component của shadcn/ui (Button, Card, Tabs, Select...)
│   │   ├── upload/            # Các component phục vụ bước tải tệp
│   │   ├── mapping/           # Các component phục vụ bước chọn cột và cấu hình
│   │   ├── dashboard/         # Các thẻ KPI tóm tắt kết quả
│   │   └── results/           # Bảng dữ liệu tương tác và nút xuất file
│   ├── hooks/                 # Custom React Hooks điều phối trạng thái
│   ├── lib/                   # Tiện ích và Lõi thuật toán
│   │   ├── engine/            # Lõi Parser, Normalizer, Matcher, Exporter thuần túy
│   │   └── utils.ts           # Hàm gộp class cn() của Tailwind
│   └── types/                 # Type definitions cho dữ liệu bảng tính và đối soát
├── tests/                     # Dữ liệu mock fixtures và unit tests
├── next.config.mjs            # Cấu hình Next.js client fallbacks
├── package.json               # Quản lý thư viện phụ thuộc
├── tailwind.config.ts         # Cấu hình giao diện và màu sắc
└── tsconfig.json              # Cấu hình TypeScript strict mode
```

---

## 7. Tiêu chí nghiệm thu hệ thống (Acceptance Criteria)

* **AC-01 (Tải tệp & Parse)**: Kéo thả thành công 1 tệp `.xlsx` và 1 tệp `.csv` dung lượng tối đa 10MB; hệ thống phân tích trong dưới 2 giây và hiển thị đúng toàn bộ danh sách cột trong dropdown.
* **AC-02 (Chuẩn hóa tự động)**: Khóa `ORD-101 ` (thừa dấu cách) ở Tệp A phải khớp chính xác với `ord-101` ở Tệp B khi bật Auto-Trim.
* **AC-03 (Phát hiện sai lệch & Tính Delta)**: Với dòng có cùng mã khóa nhưng giá trị lệch nhau (File A = `1,000,000`, File B = `900,000`), hệ thống phân loại đúng vào tab "Lệch giá trị" và ghi nhận $\Delta = -100,000$ không bị lỗi floating-point.
* **AC-04 (Bóc tách dòng thiếu)**: Tách biệt chính xác các mã chỉ xuất hiện ở Tệp A và các mã chỉ xuất hiện ở Tệp B.
* **AC-05 (Xuất báo cáo Excel)**: Tệp Excel tải về gồm đủ 4 sheet kết quả; các dòng chênh lệch được tô màu nền cam/đỏ; mở bình thường trên cả Microsoft Excel và Google Sheets.
* **AC-06 (Bảo mật Zero-Server)**: Không có bất kỳ HTTP request POST/PUT nào chứa dữ liệu tệp được gửi ra khỏi trình duyệt người dùng.

---

## 8. Hướng dẫn thực thi & Lệnh Vibe Coding (Actionable Prompts)

### 8.1 Lệnh khởi tạo dự án qua Terminal
```bash
# 1. Khởi tạo dự án Next.js App Router
npx create-next-app@latest reconciler-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd reconciler-app

# 2. Cài đặt các dependencies lõi
npm install exceljs papaparse big.js file-saver lucide-react clsx tailwind-merge
npm install -D @types/papaparse @types/big.js @types/file-saver

# 3. Khởi tạo shadcn/ui và cài đặt UI primitives
npx shadcn@latest init
npx shadcn@latest add button card tabs select input table badge
```

### 8.2 Prompt mẫu để nạp vào AI Coding Tool (Cursor / Claude Code)
> *"Tôi đang phát triển dự án Next.js App Router theo tài liệu PROJECT-BLUEPRINT.md. Hãy giúp tôi tạo cấu trúc các thư mục trong `src/` và lập trình tầng Core Engine (`src/lib/engine/normalizer.ts` và `src/lib/engine/matcher.ts`) dưới dạng pure TypeScript functions, sử dụng big.js để tính chênh lệch delta. Đảm bảo mã nguồn type-safe và tuân thủ các tiêu chí nghiệm thu AC-02, AC-03."*

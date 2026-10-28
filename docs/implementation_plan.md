# KẾ HOẠCH TRIỂN KHAI CHI TIẾT (IMPLEMENTATION-PLAN.md)
## Dự án: Smart Sheet Reconciler (RecoSheet)
**Phiên bản:** 1.0 (Phased Execution Plan & Agent Skills Mapping)  
**Nền tảng:** Next.js 14/15 App Router + TypeScript + Tailwind CSS + shadcn/ui + ExcelJS  
**Mục tiêu:** Bản kế hoạch hành động chia nhỏ theo từng Phase và Task độc lập, tích hợp chính xác các kỹ năng trong thư mục `.agents/skills` để AI coding agent thực thi tuần tự, có kiểm thử và nghiệm thu chặt chẽ.

---

## 1. Bản đồ tổng quan các Phase & Biểu đồ phụ thuộc

```
[Phase 1: Foundation & Types]
           │
           ▼
[Phase 2: Core Engine (Pure TS)] ──(Chạy song song Parser & Matcher)──
           │
           ▼
[Phase 3: State & Hooks Layer]
           │
           ▼
[Phase 4: Presentation & UI] ────(Chạy song song các Component khối)──
           │
           ▼
[Phase 5: Quality, Security & Release]
```

* **Nguyên tắc phụ thuộc**: Mỗi Phase phải vượt qua Checkpoint kiểm thử trước khi chuyển sang Phase tiếp theo. Tuyệt đối không làm giao diện UI (Phase 4) khi lõi thuật toán (Phase 2) chưa hoàn thành và pass 100% unit tests.

---

## 2. Chi tiết các Phase và Phân rã Task (Kèm Agent Skills Mapping)

### PHASE 1: Nền tảng cấu hình & Hợp đồng dữ liệu (Foundation & Domain Contracts)
*Mục tiêu*: Thiết lập các thiết lập build tĩnh, ngăn lỗi SSR của Next.js và định nghĩa chặt chẽ kiểu dữ liệu cho toàn bộ dự án.

#### Task 1.1: Khởi tạo Next.js Fallbacks & Domain Schemas
* **Mục tiêu**: Tạo cấu hình `next.config.mjs` an toàn cho browser và viết toàn bộ TypeScript interfaces.
* **Kỹ năng sử dụng**: `spec-driven-development`, `api-and-interface-design`
* **Phạm vi & Tệp liên quan**:
  * `next.config.mjs` (bổ sung fallback Webpack: `fs: false`, `path: false`, `crypto: false`).
  * `src/types/spreadsheet.ts` (định nghĩa `RowData`, `ColumnSchema`, `ParsedSheet`, `SpreadsheetParseError`).
  * `src/types/reconciliation.ts` (định nghĩa `MatchStatus`, `DiffRecord`, `ReconcileConfig`, `ReconcileSummary`).
* **Tiêu chí nghiệm thu (AC)**: Lệnh `npm run build` không báo lỗi type; toàn bộ các trường của bảng tính và kết quả đối soát được định kiểu rõ ràng, không dùng `any`.
* **Cách thức kiểm tra**: Chạy `npx tsc --noEmit`.

#### Task 1.2: Thiết lập Design System & Thư viện UI cơ sở
* **Mục tiêu**: Cài đặt các thành phần primitive của shadcn/ui và tinh chỉnh bảng màu.
* **Kỹ năng sử dụng**: `design-system`, `ui-styling`
* **Phạm vi & Tệp liên quan**:
  * `src/app/globals.css`, `tailwind.config.ts`.
  * Các component trong `src/components/ui/` (`button`, `card`, `tabs`, `table`, `badge`, `select`, `input`, `dialog`).
* **Tiêu chí nghiệm thu (AC)**: Các component render được trên trang thử nghiệm; màu sắc đồng nhất theo preset Nova (Geist + Lucide).
* **Cách thức kiểm tra**: Import thử 1 `<Card>` và `<Button>` vào `src/app/page.tsx` và chạy `npm run dev`.

---

### PHASE 2: Lõi thuật toán độc lập (Core Reconciliation Engine)
*Mục tiêu*: Xây dựng toàn bộ logic xử lý dữ liệu thuần túy (Pure TypeScript functions) trong `src/lib/engine/`. Không chứa React/JSX.

#### Task 2.1: Bộ chuẩn hóa chuỗi và parse số tiền an toàn (Normalizer)
* **Mục tiêu**: Viết thuật toán cắt khoảng trắng ẩn (`TRIM`), loại bỏ dấu gạch ngang/dấu chấm thừa và chuyển đổi chuỗi tiền tệ thành số thực.
* **Kỹ năng sử dụng**: `test-driven-development`, `constraint-driven-development`
* **Phạm vi & Tệp liên quan**:
  * `src/lib/engine/normalizer.ts`
  * `src/lib/engine/__tests__/normalizer.test.ts`
* **Phụ thuộc**: Task 1.1
* **Tiêu chí nghiệm thu (AC)**: Xử lý đúng các ca góc: `" ORD-001 "` $\rightarrow$ `"ord-001"`, `"(1,500,000)"` $\rightarrow$ `-1500000`, `"1.250,50 đ"` $\rightarrow$ `1250.5`.
* **Cách thức kiểm tra**: Chạy `npx vitest run src/lib/engine/__tests__/normalizer.test.ts`.

#### Task 2.2: Thuật toán so khớp 1-1 và tính chênh lệch tiền tệ (Matcher)
* **Mục tiêu**: Sử dụng Map/Hash Table để so sánh 2 mảng dữ liệu với độ phức tạp $O(N + M)$ và dùng `big.js` tính delta chênh lệch.
* **Kỹ năng sử dụng**: `test-driven-development`, `implementation-planning`
* **Phạm vi & Tệp liên quan**:
  * `src/lib/engine/matcher.ts`
  * `src/lib/engine/__tests__/matcher.test.ts`
* **Phụ thuộc**: Task 2.1
* **Tiêu chí nghiệm thu (AC)**: Phân loại chuẩn xác 4 nhóm: `matched`, `discrepancy`, `onlyInA`, `onlyInB`; tính đúng $\Delta = B - A$; tôn trọng dung sai số học `tolerance`.
* **Cách thức kiểm tra**: Chạy `npx vitest run src/lib/engine/__tests__/matcher.test.ts`.

#### Task 2.3: Bộ phân tích tệp bảng tính (Parser) *(Có thể chạy song song với Task 2.2)*
* **Mục tiêu**: Bóc tách tệp `.xlsx` bằng `exceljs` và tệp `.csv` bằng `papaparse` thành mảng JavaScript chuẩn.
* **Kỹ năng sử dụng**: `library-researcher`, `incremental-implementation`
* **Phạm vi & Tệp liên quan**:
  * `src/lib/engine/parser.ts`
  * `src/lib/engine/__tests__/parser.test.ts`
* **Phụ thuộc**: Task 1.1
* **Tiêu chí nghiệm thu (AC)**: Đọc được sheet đầu tiên; tự động lấy dòng đầu làm danh sách cột; ném ra ngoại lệ `SpreadsheetParseError` rõ ràng nếu file hỏng.
* **Cách thức kiểm tra**: Viết test mock `File` object và parse file test trong `public/sample-data/`.

#### Task 2.4: Bộ tạo tệp báo cáo Excel có màu sắc (Exporter)
* **Mục tiêu**: Sử dụng `exceljs` dựng workbook 4 sheet kết quả kèm định dạng header in đậm và tô màu cam dòng lệch.
* **Kỹ năng sử dụng**: `library-researcher`, `incremental-implementation`
* **Phạm vi & Tệp liên quan**:
  * `src/lib/engine/exporter.ts`
  * `src/lib/engine/__tests__/exporter.test.ts`
* **Phụ thuộc**: Task 1.1, Task 2.2
* **Tiêu chí nghiệm thu (AC)**: Tạo thành công tệp nhị phân Blob; mở được trên Microsoft Excel và Google Sheets mà không báo lỗi format.
* **Cách thức kiểm tra**: Chạy test kiểm tra số lượng worksheet và cell styles được tạo trong workbook.

---

### PHASE 3: Tầng điều phối trạng thái (Custom React Hooks Layer)
*Mục tiêu*: Đóng gói toàn bộ logic gọi Engine và quản lý tiến trình tính toán, tách rời hoàn toàn khỏi giao diện hiển thị.

#### Task 3.1: Hook quản lý tải và đọc tệp vào RAM
* **Mục tiêu**: Quản lý File A và File B, gọi `parser.ts` và trả về preview 5 dòng đầu.
* **Kỹ năng sử dụng**: `incremental-implementation`, `debugging-and-error-recovery`
* **Phạm vi & Tệp liên quan**: `src/hooks/useFileUpload.ts`
* **Phụ thuộc**: Task 2.3
* **Tiêu chí nghiệm thu (AC)**: Quản lý tốt trạng thái `isLoadingFile`, báo lỗi qua callback nếu người dùng tải sai định dạng.
* **Cách thức kiểm tra**: Test luồng kéo thả giả lập trong component tạm.

#### Task 3.2: Hook điều phối đối soát & lưu kết quả
* **Mục tiêu**: Tiếp nhận cấu hình chọn cột từ người dùng, gọi `matcher.ts` và lưu kết quả vào state.
* **Kỹ năng sử dụng**: `incremental-implementation`, `performance-optimization`
* **Phạm vi & Tệp liên quan**: `src/hooks/useReconciler.ts`
* **Phụ thuộc**: Task 2.2
* **Tiêu chí nghiệm thu (AC)**: Bấm "Bắt đầu đối soát" chuyển trạng thái mượt mà, tính toán không làm đơ UI, trả về dữ liệu cho 4 tab.
* **Cách thức kiểm tra**: Gọi hook với 2 mảng dữ liệu mẫu và kiểm tra state trả về.

#### Task 3.3: Hook xuất báo cáo Excel Blob
* **Mục tiêu**: Kích hoạt `exporter.ts`, tạo Blob và gọi `file-saver` để tải file về máy tính người dùng.
* **Kỹ năng sử dụng**: `incremental-implementation`
* **Phạm vi & Tệp liên quan**: `src/hooks/useExportExcel.ts`
* **Phụ thuộc**: Task 2.4
* **Tiêu chí nghiệm thu (AC)**: Khi gọi hàm xuất file, browser tự động mở hộp thoại tải tệp `Bao-cao-doi-soat-[ngay].xlsx`.
* **Cách thức kiểm tra**: Bấm nút xuất file và kiểm tra tệp tải về trên máy.

---

### PHASE 4: Xây dựng giao diện người dùng (Presentation & UI Engineering)
*Mục tiêu*: Xây dựng các component trực quan theo từng bước của luồng trải nghiệm.

#### Task 4.1: Khối Bước 1 - Kéo thả tệp & Xem trước (Upload Area) *(Song song)*
* **Mục tiêu**: Vùng kéo thả drag-and-drop 2 tệp với hiệu ứng kéo thả mượt mà, kèm modal xem trước 5 dòng đầu.
* **Kỹ năng sử dụng**: `frontend-ui-engineering`, `ui-ux-pro-max`
* **Phạm vi & Tệp liên quan**:
  * `src/components/upload/DropzoneArea.tsx`
  * `src/components/upload/FileCard.tsx`
  * `src/components/upload/PreviewDataModal.tsx`
* **Phụ thuộc**: Task 1.2, Task 3.1
* **Tiêu chí nghiệm thu (AC)**: Hiển thị tên tệp, dung lượng, số dòng/cột sau khi tải; bấm vào xem trước mở modal hiển thị đúng bảng dữ liệu.
* **Cách thức kiểm tra**: Kéo thả tệp trực tiếp trên trình duyệt.

#### Task 4.2: Khối Bước 2 - Thiết lập quy tắc đối soát (Mapping Area) *(Song song)*
* **Mục tiêu**: Các dropdown chọn Cột Khóa, Cột Giá trị, ô nhập Tolerance và nút bật tắt Auto-Trim.
* **Kỹ năng sử dụng**: `frontend-ui-engineering`, `ui-styling`
* **Phạm vi & Tệp liên quan**:
  * `src/components/mapping/ColumnSelector.tsx`
  * `src/components/mapping/ToleranceInput.tsx`
  * `src/components/mapping/CleanOptionsToggle.tsx`
* **Phụ thuộc**: Task 1.2
* **Tiêu chí nghiệm thu (AC)**: Tự động tải danh sách cột từ 2 file vào dropdown; hiển thị cảnh báo nếu chưa chọn đủ cột khóa.
* **Cách thức kiểm tra**: Kiểm tra tương tác form và chọn giá trị.

#### Task 4.3: Khối Bước 3 & 4 - Dashboard & Bảng sai lệch tương tác
* **Mục tiêu**: 4 thẻ KPI thống kê số liệu và bảng hiển thị phân loại 4 tab (có ô tìm kiếm và highlight màu cam dòng lệch).
* **Kỹ năng sử dụng**: `frontend-ui-engineering`, `ui-ux-pro-max`, `performance-optimization`
* **Phạm vi & Tệp liên quan**:
  * `src/components/dashboard/SummaryCards.tsx`
  * `src/components/results/ResultTabs.tsx`
  * `src/components/results/DiffTable.tsx`
  * `src/components/results/TableSearchFilter.tsx`
  * `src/components/results/ExportButton.tsx`
* **Phụ thuộc**: Task 1.2, Task 3.2, Task 3.3
* **Tiêu chí nghiệm thu (AC)**: Chuyển tab mượt mà; ô chênh lệch được bôi đỏ; gõ tìm kiếm mã đơn lọc kết quả tức thì.
* **Cách thức kiểm tra**: Thử nghiệm lọc dữ liệu trên bộ test 1.000 dòng.

#### Task 4.4: Lắp ghép hoàn chỉnh trang chủ (Page Orchestration)
* **Mục tiêu**: Kết nối 4 khối thành một luồng Wizard mượt mà trên trang chính `src/app/page.tsx`.
* **Kỹ năng sử dụng**: `frontend-ui-engineering`, `code-simplification`
* **Phạm vi & Tệp liên quan**: `src/app/page.tsx`, `src/components/layout/Header.tsx`, `Footer.tsx`
* **Phụ thuộc**: Toàn bộ Task từ 4.1 đến 4.3
* **Tiêu chí nghiệm thu (AC)**: Trải nghiệm người dùng thông suốt từ Tải tệp $\rightarrow$ Cấu hình $\rightarrow$ Chạy đối soát $\rightarrow$ Xem kết quả & Tải file.
* **Cách thức kiểm tra**: Thực hiện trọn vẹn 1 kịch bản đối soát từ đầu đến cuối trên trình duyệt.

---

### PHASE 5: Đánh giá chất lượng, Bảo mật & Triển khai (Quality, Security & Launch)
*Mục tiêu*: Đảm bảo cam kết bảo mật Zero-Server, tối ưu hiệu năng và đóng gói sẵn sàng đưa lên môi trường thực tế.

#### Task 5.1: Kiểm tra an ninh Zero-Server & Quyền riêng tư
* **Mục tiêu**: Kiểm tra DevTools Network tab để đảm bảo không có gói tin nào gửi dữ liệu bảng tính ra máy chủ ngoài.
* **Kỹ năng sử dụng**: `security-audit`, `security-and-hardening`, `browser-testing-with-devtools`
* **Phạm vi**: Toàn bộ luồng ứng dụng.
* **Tiêu chí nghiệm thu (AC)**: 100% network requests chỉ là static assets; zero telemetry dữ liệu người dùng (AC-06).
* **Cách thức kiểm tra**: Mở DevTools Network tab, bấm đối soát và kiểm tra danh sách HTTP requests.

#### Task 5.2: Tối ưu hiệu năng tải & Render bảng tính
* **Mục tiêu**: Kiểm tra thời gian xử lý file 10.000 dòng và tối ưu render nếu cần (dùng pagination hoặc virtualization).
* **Kỹ năng sử dụng**: `performance-optimization`, `browser-testing-with-devtools`
* **Phạm vi**: `src/components/results/DiffTable.tsx`, `src/lib/engine/matcher.ts`
* **Tiêu chí nghiệm thu (AC)**: Đối soát 10.000 dòng trong dưới 2 giây; chuyển tab không bị giật lag.
* **Cách thức kiểm tra**: Chạy benchmark với tệp mock 10.000 dòng.

#### Task 5.3: Code Review & Tối giản hóa cấu trúc
* **Mục tiêu**: Rà soát lại toàn bộ codebase, loại bỏ code thừa, chuẩn hóa type definitions và đảm bảo không có cảnh báo eslint.
* **Kỹ năng sử dụng**: `code-review-and-quality`, `code-simplification`
* **Tiêu chí nghiệm thu (AC)**: Lệnh `npm run lint` và `npm run build` kết thúc với exit code 0 không có cảnh báo.
* **Cách thức kiểm tra**: Chạy `npm run lint && npm run build`.

#### Task 5.4: Thiết lập CI Pipeline & Đóng gói triển khai
* **Mục tiêu**: Tạo GitHub Actions workflow tự động chạy test khi push và hướng dẫn deploy 1-click lên Vercel.
* **Kỹ năng sử dụng**: `ci-cd-and-automation`, `git-workflow-and-versioning`, `shipping-and-launch`
* **Phạm vi & Tệp liên quan**: `.github/workflows/ci.yml`, `README.md`
* **Tiêu chí nghiệm thu (AC)**: Dự án build thành công trên Vercel và chạy mượt mà trên domain production.
* **Cách thức kiểm tra**: Test build cục bộ và push lên repo GitHub.

---

## 3. Ma trận phân công Kỹ năng Agent (Skills Matrix)

| Giai đoạn (Phase) | Task cụ thể | Kỹ năng chính (.agents/skills) | Kỹ năng hỗ trợ |
| :--- | :--- | :--- | :--- |
| **Phase 1: Foundation** | 1.1 Next.js Fallbacks & Types | `spec-driven-development` | `api-and-interface-design` |
| | 1.2 Design System & UI Init | `design-system` | `ui-styling` |
| **Phase 2: Core Engine** | 2.1 Chuẩn hóa Normalizer | `test-driven-development` | `constraint-driven-development` |
| | 2.2 Thuật toán Matcher 1-1 | `test-driven-development` | `implementation-planning` |
| | 2.3 Bộ phân tích Parser | `library-researcher` | `incremental-implementation` |
| | 2.4 Bộ xuất file Exporter | `library-researcher` | `incremental-implementation` |
| **Phase 3: State & Hooks**| 3.1 Hook useFileUpload | `incremental-implementation` | `debugging-and-error-recovery` |
| | 3.2 Hook useReconciler | `incremental-implementation` | `performance-optimization` |
| | 3.3 Hook useExportExcel | `incremental-implementation` | `code-simplification` |
| **Phase 4: UI Engineering**| 4.1 Khối Dropzone & Preview | `frontend-ui-engineering` | `ui-ux-pro-max` |
| | 4.2 Khối Mapping & Options | `frontend-ui-engineering` | `ui-styling` |
| | 4.3 Khối Dashboard & Table | `frontend-ui-engineering` | `performance-optimization` |
| | 4.4 Lắp ghép trang chủ Page | `frontend-ui-engineering` | `code-simplification` |
| **Phase 5: Audit & Launch** | 5.1 Bảo mật Zero-Server | `security-audit` | `security-and-hardening` |
| | 5.2 Tối ưu hóa hiệu năng | `performance-optimization` | `browser-testing-with-devtools` |
| | 5.3 Code Review & Refactor | `code-review-and-quality` | `code-simplification` |
| | 5.4 CI/CD & Shipping | `ci-cd-and-automation` | `shipping-and-launch` |

---

## 4. Các điểm dừng kiểm định chất lượng (Checkpoints)

1. **Checkpoint 1 (Sau Phase 1)**: Kiểm tra `npx tsc --noEmit` $\rightarrow$ Đảm bảo không còn lỗi thiếu kiểu dữ liệu.
2. **Checkpoint 2 (Sau Phase 2 - Quan trọng nhất)**: Chạy `npx vitest run` $\rightarrow$ Toàn bộ test case của Normalizer, Matcher và Parser phải đạt 100% pass trước khi đụng vào UI.
3. **Checkpoint 3 (Sau Phase 3)**: Kiểm tra dữ liệu mock luân chuyển trơn tru qua các React Custom Hooks.
4. **Checkpoint 4 (Sau Phase 4)**: Dùng `browser-testing-with-devtools` chạy thử nghiệm thực tế trên trình duyệt với 2 file Excel mẫu.
5. **Checkpoint 5 (Sau Phase 5)**: Nghiệm thu toàn diện 6 tiêu chí AC (AC-01 đến AC-06) và sẵn sàng chia sẻ ứng dụng.

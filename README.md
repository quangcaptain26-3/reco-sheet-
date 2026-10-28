# RecoSheet

**Đối soát hai bảng tính Excel/CSV ngay trong trình duyệt — dữ liệu không rời khỏi máy bạn.**

RecoSheet giúp kế toán, vận hành và logistics so khớp hai danh sách (sổ quỹ ↔ sao kê,
đơn hàng ↔ báo cáo đối tác, danh sách container ↔ bảng kê cước…) trong vài giây,
phân loại rõ 4 nhóm chênh lệch và xuất một báo cáo Excel hoàn chỉnh để bàn giao.

> **Zero-Server:** 100% tệp được đọc, làm sạch, so khớp và xuất báo cáo trong RAM
> của trình duyệt. Không có API upload, không lưu dữ liệu trên server, không
> telemetry nội dung tệp.

**Trạng thái:** `RELEASED READY 1.0` · **Test:** 59/59 · **Build:** static + Docker
· **License:** chưa chọn (bổ sung trước khi public nếu cần).

---

## 1. Ý tưởng & vấn đề

### Nỗi đau thực tế

Một kế toán thanh toán cuối tháng có hai tệp:

- **Tệp A** — sổ quỹ nội bộ, xuất từ phần mềm kế toán.
- **Tệp B** — sao kê ngân hàng hoặc báo cáo tiền về từ đối tác.

Hai tệp có cùng mã giao dịch, nhưng:

- Mã bị dư dấu cách: `" ORD-101 "` so với `"ord-101"`.
- Hoa/thường lộn xộn, có nơi dùng `-`, có nơi dùng `.` hoặc `/`.
- Số tiền lúc là `1,000,000`, lúc là `1.000.000`, lúc có `đ`, lúc âm trong ngoặc
  `(1,500,000)`.
- Không phải dòng nào cũng có ở cả hai bên.

`VLOOKUP`/`XLOOKUP` trả về `#N/A` vì một dấu cách vô hình. Người dùng chuyển sang
dò mắt từng dòng, hoặc upload file tài chính lên một website lạ — đúng thứ mà nhiều
công ty không cho phép.

### Giải pháp

RecoSheet biến việc đối soát thành một quy trình 4 bước:

```
Tải 2 tệp  →  Chọn cột khóa/giá trị  →  Đối soát  →  Xem kết quả & xuất Excel
 .xlsx/.csv     key + value + dung sai     O(N+M)       4 nhóm + báo cáo 5 sheet
```

Mọi thứ chạy trong tab hiện tại. Đóng tab là dữ liệu biến mất — không có bản sao
nào trên máy chủ.

### Người dùng mục tiêu

| Persona | Công việc điển hình |
| --- | --- |
| **Kế toán thanh toán / đối soát công nợ** | Đối chiếu sổ quỹ với sao kê ngân hàng, hóa đơn nhà cung cấp |
| **Vận hành sàn TMĐT / bán hàng** | Đối chiếu đơn xuất kho với báo cáo tiền về GHN, Viettel Post, Shopee, TikTok Shop |
| **Điều vận / chứng từ logistics & XNK** | Đối chiếu số container, số seal, phí lưu kho/bãi giữa hãng tàu và bảng kê nội bộ |

Đây là công cụ **public self-serve**: không tài khoản, không workspace, không cài đặt.
Người dùng mở web, thả hai tệp và làm xong việc.

### Điểm khác biệt

1. **Zero-server là cam kết chính** — không phải tính năng phụ. Tệp tài chính không
   rời khỏi trình duyệt, nên công cụ mới dùng được cho dữ liệu nội bộ.
2. **Dữ liệu bẩn là đầu vào, không phải điều kiện tiên quyết** — tự cắt khoảng
   trắng, bỏ ký tự vô hình, chuẩn hóa hoa/thường và định dạng tiền Việt.
3. **Số học chính xác tuyệt đối** — Δ tính bằng `big.js`, không có lỗi floating-point.
4. **Đầu ra là một tài liệu hoàn chỉnh** — báo cáo Excel 5 sheet có tô màu, không
   phải một bảng diff thô.

### Không phải là gì

- Không phải nơi lưu trữ/tra cứu bảng tính trên cloud.
- Không phải ETL hay data warehouse.
- Không phải công cụ matching mờ (fuzzy) ở phiên bản 1.0.
- Không xử lý quan hệ 1-nhiều (một hóa đơn thanh toán nhiều đợt) ở phiên bản 1.0.

---

## 2. Luồng sử dụng

### Bước 1 — Tải hai bảng tính

- Kéo thả hoặc bấm chọn **Tệp A** (nguồn đối chiếu) và **Tệp B** (nguồn so sánh).
- Hỗ trợ `.xlsx` và `.csv`, tối đa **10MB/tệp**.
- Đọc **sheet đầu tiên**; dòng đầu tiên là tên cột.
- Hiển thị tên tệp, dung lượng, số dòng/cột, tên sheet và preview **5 dòng đầu**.
- Tệp `.xls` (Excel 97–2003) được phát hiện và báo lỗi có hướng dẫn chuyển sang
  `.xlsx`; không cố đọc định dạng BIFF cũ.

### Bước 2 — Chọn quy tắc

- **Cột khóa** ở mỗi tệp (bắt buộc): mã đơn, số hóa đơn, số vận đơn, số container…
- **Cột giá trị** (tùy chọn): số tiền, số lượng, phí… phải chọn ở cả hai tệp hoặc
  bỏ trống ở cả hai.
- **Dung sai** `±X`: chênh lệch trong ngưỡng được coi là khớp; mặc định `0`.
- **Làm sạch thông minh**:
  - Tự cắt khoảng trắng, gộp khoảng trắng giữa chuỗi, bỏ ký tự zero-width/NBSP.
  - Không phân biệt hoa/thường.
  - Tùy chọn bỏ dấu phân cách `- . _ /`.
- Cảnh báo nếu phát hiện **mã trùng lặp**; vẫn cho chạy và ghép từng cặp theo thứ
  tự xuất hiện.

### Bước 3 — Đối soát

- Thuật toán hash map 1-1, độ phức tạp `O(N + M)`.
- Kết quả phân loại:
  - **Khớp hoàn toàn** — mã khớp và giá trị nằm trong dung sai.
  - **Lệch giá trị** — cùng mã nhưng `Δ = Giá trị B − Giá trị A` vượt dung sai.
  - **Chỉ có ở A** — mã không xuất hiện ở B.
  - **Chỉ có ở B** — mã không xuất hiện ở A.
- Hiển thị verdict tổng quan, “Thiết lập đã dùng”, 4 KPI, tổng chênh lệch và thời
  gian xử lý.

### Bước 4 — Xem & xuất báo cáo

- 4 tab kết quả, tìm kiếm theo mã khóa, phân trang 50 dòng/trang.
- Dòng lệch được tô màu cam; mã thiếu ở A/B dùng màu đỏ/xanh tương ứng.
- Nút **Tải báo cáo Excel** tạo file `.xlsx` gồm:
  1. `Tổng quan`
  2. `Lệch giá trị`
  3. `Chỉ có ở A`
  4. `Chỉ có ở B`
  5. `Khớp hoàn toàn`

  Header in đậm, dòng lệch tô cam, ô Δ màu đỏ, freeze pane, auto filter, ghi lại
  đầy đủ cột khóa/giá trị, dung sai và 3 cleaning flags.

---

## 3. Cách hoạt động

### 3.1 Chuẩn hóa khóa

`src/lib/engine/normalizer.ts` xử lý:

- NFC normalize, bỏ zero-width (`\u200B-\u200D`, `\uFEFF`), đổi NBSP thành space.
- Trim + gộp khoảng trắng (khi bật Auto-Trim).
- Lowercase (khi bật case-insensitive).
- Bỏ `- . _ / \` (khi bật tùy chọn).

Ví dụ: `" ORD-001 "` → `ord-001` với Auto-Trim + case-insensitive.

### 3.2 Parse số tiền

Hỗ trợ:

| Chuỗi | Kết quả |
| --- | --- |
| `1,000,000` | `1000000` |
| `1.000.000` | `1000000` |
| `1.250,50 đ` | `1250.5` |
| `(1,500,000)` | `-1500000` |
| `15.000-` | `-15000` |
| `₫ 2.000.000` | `2000000` |

Heuristic phân biệt dấu thập phân và dấu ngăn cách hàng nghìn; giá trị không đọc
được sẽ được đánh dấu là cần kiểm tra thay vì âm thầm coi là `0`.

### 3.3 So khớp 1-1

- Tạo bucket theo normalized key cho tệp A.
- Duyệt tệp B một lần; lấy dòng A chưa ghép cùng key.
- Dòng B không có A → `onlyInB`; dòng A còn lại → `onlyInA`.
- Khóa trùng được ghép theo thứ tự xuất hiện, không cộng dồn.
- Dòng có khóa rỗng bị bỏ qua và được đếm riêng.

### 3.4 Tính Δ

```text
Δ = Giá trị B − Giá trị A
```

Dùng `big.js` và lưu dưới dạng **chuỗi thập phân** trong `DiffRecord`, nên không có
sai số kiểu `0.1 + 0.2`. Dung sai được so sánh bằng `abs(Δ) <= tolerance`.

### 3.5 Báo cáo

`src/lib/engine/exporter.ts` dùng ExcelJS, import động trong event handler, dựng
workbook 5 sheet. Các ô text bắt đầu bằng `= + - @` (không phải số) được escape để
chống formula injection.

---

## 4. Kiến trúc

### 4.1 Phân lớp

```
┌──────────────────────────────────────────────┐
│ Presentation  — app/, components/           │
│ React 19, Tailwind, shadcn/ui, Lucide       │
└──────────────────────┬───────────────────────┘
                       │ props / callbacks
┌──────────────────────▼───────────────────────┐
│ Coordination  — hooks/                       │
│ useFileUpload, useReconciler, useExportExcel│
└──────────────────────┬───────────────────────┘
                       │ plain data
┌──────────────────────▼───────────────────────┐
│ Pure Engine   — lib/engine/                  │
│ parser → normalizer → matcher → exporter    │
└──────────────────────┬───────────────────────┘
                       │ contracts
┌──────────────────────▼───────────────────────┐
│ Domain Types  — types/                       │
│ spreadsheet.ts, reconciliation.ts            │
└──────────────────────────────────────────────┘
```

**Quy tắc bất biến:** `src/lib/engine/` là pure TypeScript — không React, không JSX,
không hooks, không `next/*`. Engine chạy độc lập trong Vitest/CLI.

### 4.2 Cây thư mục

```text
reconciler-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Orchestrator wizard 4 bước
│   │   ├── layout.tsx            # Metadata, font, shell
│   │   └── globals.css           # Tailwind v4 + design tokens
│   ├── components/
│   │   ├── upload/               # DropzoneArea, FileCard, PreviewDataModal
│   │   ├── mapping/              # ColumnSelector, ToleranceInput, CleanOptionsToggle
│   │   ├── dashboard/            # SummaryCards, DiscrepancyBadge
│   │   ├── results/              # ResultTabs, DiffTable, TableSearchFilter, ExportButton
│   │   ├── layout/               # Header, Footer
│   │   ├── shared/               # StepHeading, InlineAlert
│   │   └── ui/                   # shadcn/ui primitives
│   ├── hooks/                    # useFileUpload, useReconciler, useExportExcel
│   ├── lib/
│   │   ├── engine/               # parser, normalizer, matcher, exporter + tests
│   │   ├── format.ts             # Format tiền/số/thời gian
│   │   ├── logger.ts             # Log không chứa dữ liệu tài chính
│   │   └── utils.ts              # cn()
│   └── types/                    # Domain contracts
├── tests/                        # Fixtures + release acceptance tests
├── public/sample-data/           # Bộ dữ liệu mẫu
├── docs/                         # PRD, blueprint, architecture, tech stack
├── Dockerfile                    # Static nginx image (mặc định)
├── Dockerfile.standalone         # Node standalone (fallback)
├── docker-compose.yml
├── nginx.conf
├── PRODUCT.md                    # Product truth
├── DESIGN.md                     # Design system
├── UPDATE.md                     # Nhật ký tiến độ
├── RELEASE.md                    # Checklist phát hành
└── README.md
```

### 4.3 Luồng dữ liệu

1. `DropzoneArea` nhận `File`.
2. `useFileUpload` gọi `parseSpreadsheetFile` → `ParsedSheet` (rows + columns + preview).
3. Người dùng chọn cột; `useReconciler` nhận `ReconcileConfig`.
4. `reconcileRows` chạy normalize + hash map + Big.js → 4 mảng kết quả.
5. `ResultTabs`/`DiffTable` hiển thị dữ liệu đã lọc bằng `useMemo`.
6. `useExportExcel` gọi exporter + `file-saver` để tải `.xlsx`.

---

## 5. Công nghệ

| Thành phần | Lựa chọn | Vai trò |
| --- | --- | --- |
| Framework | Next.js 16.4 App Router (Turbopack) | Static/client shell, build |
| UI | React 19.3, TypeScript strict | Giao diện, type safety |
| Styling | Tailwind CSS v4, shadcn/ui (Base UI) | Design system, primitives |
| Icons | Lucide React | Icon |
| Excel đọc/ghi | `exceljs` | `.xlsx`, báo cáo nhiều sheet |
| CSV | `papaparse` | Parse CSV, delimiter/BOM |
| Số học | `big.js` | Δ chính xác |
| Tải file | `file-saver` | Blob download |
| Test | Vitest | Unit + acceptance |
| Runtime Docker | Node 22 Alpine builder → nginx Alpine | Static image nhẹ |

Không dùng database, không dùng auth, không dùng API route.

---

## 6. Yêu cầu hệ thống

### Chạy local

- **Node.js >= 22** (kiểm tra `node -v`).
- npm >= 10 (đi kèm Node 22+).
- Chrome, Edge, Safari hoặc Firefox hiện đại.
- Desktop/laptop; giao diện tối ưu từ **1280px**.

### Chạy Docker

- Docker Desktop đang chạy (Windows/macOS) hoặc Docker Engine + Compose plugin.
- Cổng `3000` còn trống.

### Giới hạn dữ liệu

- Tối đa **10MB/tệp**.
- Chỉ đọc **sheet đầu tiên** của Excel.
- Thiết kế cho **< 30.000 dòng**; benchmark 10.000 dòng ~90ms.
- `.xlsx`, `.csv`; `.xls` bị từ chối có chủ đích.

---

## 7. Cài đặt local

### 7.1 Clone

```bash
git clone <repo-url> reconciler-app
cd reconciler-app
```

### 7.2 Cài dependency

```bash
npm ci
```

`npm ci` dùng đúng `package-lock.json`; nếu chỉ muốn cài nhanh trong lúc phát triển
có thể dùng `npm install`.

### 7.3 Chạy dev

```bash
npm run dev
# http://localhost:3000
```

### 7.4 Build production

```bash
npm run build
npm run start
# http://localhost:3000
```

`npm run build` mặc định tạo **standalone** output cho Node server. Docker dùng
static export (xem bên dưới).

### 7.5 Dữ liệu mẫu

```bash
npm run samples
```

Sinh lại:

- `public/sample-data/sample_internal_ledger.xlsx`
- `public/sample-data/sample_bank_statement.csv`

Kết quả kỳ vọng khi chọn `Mã đơn` ↔ `Mã giao dịch`, `Số tiền` ↔ `Số tiền`,
dung sai `0`:

| Nhóm | Số dòng |
| --- | ---: |
| Khớp hoàn toàn | 8 |
| Lệch giá trị | 2 |
| Chỉ có ở A | 2 |
| Chỉ có ở B | 2 |
| Tổng chênh lệch | −95.000 |

### 7.6 Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `EBADENGINE` / Next yêu cầu Node mới | Nâng Node lên >= 22 (`node -v`) |
| Cổng 3000 đang bận | Dừng app khác hoặc `PORT=3001 npm run start` |
| `.xls` báo không hỗ trợ | Mở bằng Excel → Save As `.xlsx` |
| File có nhiều sheet | Phiên bản 1.0 chỉ đọc sheet đầu tiên |
| Tải file quá 10MB | Chia nhỏ dữ liệu hoặc lọc bớt dòng |

---

## 8. Docker

### 8.1 Image mặc định — static nginx

App không có backend, nên image mặc định chỉ chứa HTML/JS/CSS và chạy bằng nginx.
Đây là lựa chọn nhẹ nhất.

```bash
docker compose up --build -d
# http://localhost:3000

docker compose logs -f recosheet
docker compose ps
docker compose down
```

Đặc điểm:

- Multi-stage: Node 22 Alpine build → `nginx:1.27-alpine`.
- Chỉ copy `out/` + `nginx.conf`; không copy `node_modules` vào runtime.
- **~20.7 MB compressed** (`docker image inspect`); Docker Desktop hiển thị ~77 MB
  uncompressed.
- Runtime idle: **~11.5 MiB RAM**.
- Healthcheck mỗi 30 giây.
- `nginx.conf`: gzip, cache immutable cho `/_next/static`, cache 7 ngày cho sample,
  security headers, SPA fallback.

Build static export thủ công:

```bash
NEXT_OUTPUT=export npm run build   # PowerShell: $env:NEXT_OUTPUT='export'; npm run build
docker build -t recosheet:1.0.0 .
docker run --rm -p 3000:80 recosheet:1.0.0
```

### 8.2 Fallback — Node standalone

Chỉ dùng nếu sau này thêm server-side Next.js features:

```bash
docker build -f Dockerfile.standalone -t recosheet:1.0.0-node .
docker run --rm -p 3001:3000 recosheet:1.0.0-node
```

Image này ~74.5 MB compressed / ~311 MB uncompressed; chạy user `node`, healthcheck
tại cổng 3000.

### 8.3 Lưu ý

- `NEXT_OUTPUT=export` chỉ dùng cho Docker static; nó tắt tạm `cacheComponents` vì
  PPR không hỗ trợ export mode. Build local/CI mặc định vẫn là standalone.
- Không chạy `npm run dev` và Docker cùng lúc trên cổng 3000.
- Trên VPS, đặt nginx/Caddy phía trước để terminate HTTPS; container chỉ mở cổng 80
  nội bộ.

---

## 9. Kiểm thử & chất lượng

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest run
npm run build       # Next.js production build
```

Kết quả hiện tại:

- **59/59 tests pass** (6 test files)
- **0** ESLint error/warning
- **0** TypeScript error
- Next build static route `/`
- Docker static image healthy
- Benchmark 10.000 dòng: **~90ms**
- Lighthouse desktop: Accessibility 100 · Best Practices 100 · SEO 100

Phạm vi test:

- `normalizer`: trim/case/punctuation, tiền Việt, số âm ngoặc đơn, tolerance.
- `matcher`: AC-02/03/04, duplicate key, blank key, Big.js delta, 10k benchmark.
- `parser`: CSV/XLSX, BOM, delimiter, header trùng, file hỏng/rỗng/quá lớn, `.xls`.
- `exporter`: 5 sheet, style cam/đỏ, empty state, formula injection.
- `tests/release-acceptance.test.ts`: chạy trên chính bộ dữ liệu mẫu.

CI: `.github/workflows/ci.yml` chạy `lint → typecheck → test → build` trên mọi
push/PR.

---

## 10. Bảo mật & quyền riêng tư

- **Không có API route, Server Action hay `fetch` gửi dữ liệu tệp.**
- `exceljs` và `file-saver` được **dynamic import** trong event handler.
- Nginx static không có backend; network chỉ là static assets.
- Không lưu `localStorage`/`sessionStorage` chứa dữ liệu tệp.
- Logger production chỉ ghi số dòng/cột/thời gian, không ghi giá trị tài chính.
- Formula injection trong báo cáo Excel được chặn.
- Dữ liệu biến mất khi đóng tab.

Khi deploy, không thêm analytics/API nhận file. Nếu cần thêm backend sau này, phải
giữ nguyên nguyên tắc “file không rời trình duyệt”.

---

## 11. Giới hạn & roadmap

### 1.0

- Một cột khóa, một cột giá trị mỗi bên.
- So khớp 1-1; duplicate ghép theo thứ tự.
- Chỉ sheet đầu tiên.
- `.xlsx`/`.csv`, tối đa 10MB.
- Desktop-first.

### Chưa làm

- Composite key (`Ngày` + `Mã đơn`).
- Fuzzy matching tên đối tác.
- Quan hệ 1-nhiều.
- Lưu mapping template.
- Web Worker/DuckDB-WASM cho >200.000 dòng.
- Hỗ trợ `.xls` BIFF.

---

## 12. Đưa lên GitHub & phát hành

Các bước chi tiết nằm trong [`RELEASE.md`](./RELEASE.md). Tóm tắt:

```bash
# 1. Kiểm tra lần cuối
npm run lint && npx tsc --noEmit && npm test && npm run build

# 2. Tạo repo trống trên GitHub, rồi:
git branch -M main
git add .
git commit -m "release: RecoSheet 1.0.0"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main

# 3. Tag phiên bản
git tag -a v1.0.0 -m "RecoSheet 1.0.0"
git push origin v1.0.0
```

CI sẽ tự chạy sau khi push. Vercel: import repo, giữ preset Next.js, không cần biến
môi trường hay database. Docker: `docker compose up -d --build` trên VPS.

---

## 13. Tài liệu

| Tệp | Nội dung |
| --- | --- |
| [`PRODUCT.md`](./PRODUCT.md) | Product truth: personas, positioning, constraints, absences |
| [`DESIGN.md`](./DESIGN.md) | Design system, token, component rules |
| [`RELEASE.md`](./RELEASE.md) | Checklist phát hành, GitHub, Vercel, Docker, smoke test |
| [`UPDATE.md`](./UPDATE.md) | Nhật ký tiến độ và bằng chứng kiểm thử |
| [`docs/product_requirements.md`](./docs/product_requirements.md) | PRD gốc |
| [`docs/architecture.md`](./docs/architecture.md) | Kiến trúc và ranh giới module |
| [`docs/implementation_plan.md`](./docs/implementation_plan.md) | Kế hoạch theo Phase |
| [`docs/tech_stack.md`](./docs/tech_stack.md) | Thẩm định công nghệ |
| [`docs/project_blueprint.md`](./docs/project_blueprint.md) | Blueprint tổng thể |

---

## 14. Agent Skills đã sử dụng

Các skill dưới đây là bộ tiêu chuẩn/quy trình được **yêu cầu trong prompt triển khai**
và đã định hướng cách thực hiện dự án. Skill không phải dependency runtime; không có
package nào được thêm chỉ để “dùng skill”. Riêng `impeccable` được load trực tiếp qua
skill tool sau khi bản 1.0 hoàn tất, dùng cho product truth, design system và polish.

| Giai đoạn / việc | Skills trong prompt | Cách đã áp dụng |
| --- | --- | --- |
| **Phase 1 — Foundation** | `spec-driven-development`, `api-and-interface-design`, `design-system` | Viết domain contracts `types/spreadsheet.ts` + `types/reconciliation.ts`; chốt interface trước khi code; dùng shadcn/ui base-nova và token Tailwind thống nhất |
| **Phase 2 — Core Engine** | `test-driven-development`, `constraint-driven-development`, `library-researcher` | 54 test engine; ràng buộc AC-02 → AC-04 thành test case; đọc kỹ ExcelJS/PapaParse/Big.js trước khi dùng, không cài ngoài danh sách duyệt |
| **Phase 3 — Hooks** | `incremental-implementation`, `debugging-and-error-recovery`, `performance-optimization` | Làm hooks theo từng lớp; xử lý race khi thay tệp, lỗi parse/export; `useMemo` cho tab/search và benchmark runtime |
| **Phase 4 — UI** | `frontend-ui-engineering`, `ui-styling`, `ui-ux-pro-max`, `code-simplification` | Wizard 4 bước, dropzone/mapping/results; Tailwind + shadcn; thu gọn `ResultTabs`, tách component, responsive desktop |
| **Phase 5 — Audit & CI** | `security-audit`, `security-and-hardening`, `performance-optimization`, `browser-testing-with-devtools`, `ci-cd-and-automation` | Zero-server audit, security headers/formula-injection guard; benchmark 10k; Chrome DevTools E2E; GitHub Actions lint → typecheck → test → build |
| **Final review — Release** | `code-review-and-quality`, `code-simplification`, `shipping-and-launch` | Acceptance test AC-01 → AC-06; rà soát code, dọn dead code; README + `RELEASE.md`, Docker static, smoke test trước phát hành |
| **Design system & polish** *(bổ sung ngoài prompt Phase)* | `impeccable` — `init`, `document`, `critique`, `polish`, `doctor` | Tạo `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`; critique 23/40; polish trust trail, modal focus, empty state, validation; doctor xác nhận không còn drift |

**Bằng chứng liên quan:** 59/59 tests, AC-01 → AC-06 đạt, benchmark 10.000 dòng ~90ms,
không có API route/fetch gửi dữ liệu, Docker static healthy. Chi tiết theo thời gian
nằm trong [`UPDATE.md`](./UPDATE.md); design system trong [`DESIGN.md`](./DESIGN.md);
product truth trong [`PRODUCT.md`](./PRODUCT.md).

---

## 15. Nguyên tắc phát triển

1. **File không rời browser.** Tính năng cần upload/server compute là out of scope.
2. **Làm sạch phải minh bạch.** Mọi rule đều toggleable và được ghi lại trong kết quả.
3. **Số phải chịu được thẩm định.** Big.js, Δ có dấu, dung sai rõ ràng.
4. **Báo cáo là deliverable.** Sheet tiếng Việt, style đầy đủ, bàn giao được ngay.
5. **Không tài khoản, không setup.** Màn hình đầu tiên là công việc.

Nếu đóng góp code: giữ `src/lib/engine/` pure, thêm test trước/song song, không thêm
dependency ngoài danh sách đã duyệt nếu chưa có lý do rõ ràng.

# TÀI LIỆU KIẾN TRÚC CÔNG NGHỆ & THẨM ĐỊNH THƯ VIỆN (TECH-STACK.md)
## Dự án: Smart Sheet Reconciler (RecoSheet)
**Phiên bản:** 2.0 (Cập nhật Kiến trúc Next.js App Router)  
**Mục tiêu:** Tối ưu hóa cho Vibe Coding với Next.js + shadcn/ui, đảm bảo 100% Client-Side Privacy (Zero-Server) và khả năng mở rộng linh hoạt.

---

## 1. Đánh giá tính khả thi khi dùng Next.js cho dự án này

**Hoàn toàn được, thậm chí còn có nhiều lợi thế lớn khi Vibe Coding:**
1. **Tương thích tuyệt đối với v0 và Cursor**: Các công cụ AI hiện nay (đặc biệt là v0.dev và Cursor) được tối ưu hóa sâu nhất cho Next.js App Router kết hợp hệ sinh thái `shadcn/ui`. Bạn có thể prompt sinh toàn bộ giao diện bảng tính kéo thả chỉ trong vài phút.
2. **Deploy 1-click lên Vercel**: Không cần cấu hình phức tạp, chỉ cần đẩy code lên GitHub là Vercel tự động build và cấp domain HTTPS miễn phí.
3. **Mở rộng dễ dàng cho Phase 2**: Khi muốn bổ sung tính năng lưu lịch sử, tài khoản người dùng hoặc gọi LLM để so khớp mờ (Fuzzy matching), Next.js đã có sẵn Server Actions / Route Handlers mà không cần dựng backend riêng.

---

## 2. Kiến trúc Next.js Client-First (Đảm bảo Zero-Server Privacy)

Để đảm bảo tiêu chí bảo mật tuyệt đối trong `PRODUCT-REQUIREMENTS.md` (không đẩy dữ liệu sao kê, tiền tệ lên server), kiến trúc Next.js được thiết lập như sau:

* **Mô hình Client-Side Execution (`'use client'`)**: Toàn bộ luồng kéo thả, đọc file qua `FileReader`, tính toán chênh lệch và xuất Excel được thực hiện 100% trong trình duyệt. Không có dữ liệu tệp nào được gửi qua Server Actions hay API Routes.
* **Tùy chọn Static Export (`output: 'export'`)**: Trong `next.config.mjs`, bạn có thể bật chế độ export tĩnh để đóng gói Next.js thành HTML/JS thuần nếu muốn host trên Cloudflare Pages, GitHub Pages hoặc bảo đảm 0% rủi ro rò rỉ dữ liệu lên server.

---

## 3. Stack công nghệ chính thức (Next.js + TypeScript + shadcn/ui)

* **Framework cốt lõi**: **Next.js 14/15 (App Router)** với TypeScript.
* **Component System & Styling**: **Tailwind CSS** + **shadcn/ui** (kết hợp Radix UI primitives và Lucide Icons).
* **Trình xử lý Excel**: **`exceljs`** (v4.4.0) - Hỗ trợ đọc tệp và xuất báo cáo tô màu đầy đủ với giấy phép MIT.
* **Trình xử lý CSV**: **`papaparse`** (v5.7.0) - Tự động nhận diện delimiter, đọc nhanh các tệp CSV sao kê.
* **Độ chính xác số học**: **`big.js`** (v6.2.2) - Triệt tiêu lỗi floating-point khi tính chênh lệch tiền tệ.

---

## 4. Hai lưu ý kỹ thuật quan trọng khi dùng Next.js (Tránh lỗi SSR Hydration)

Khi vibe coding bằng AI trên Next.js, có 2 điểm dễ gây lỗi build mà bạn cần nhắc AI chú ý:

1. **Tránh lỗi `window is not defined`**: 
   Thư viện `exceljs` và `file-saver` tương tác với DOM/Blob của trình duyệt. Cần đặt directive `'use client'` ở đầu các component xử lý file, hoặc chỉ gọi `exceljs` bên trong hàm xử lý sự kiện (Event Handler) của người dùng:
   ```typescript
   // Khuyên dùng: Dynamic import bên trong hàm xuất file
   const exportToExcel = async (results: ReconcileResult) => {
     const ExcelJS = (await import('exceljs')).default;
     const workbook = new ExcelJS.Workbook();
     // ... logic tạo sheet và styling
   };
   ```
2. **Cấu hình Webpack / Turbopack cho ExcelJS**:
   ExcelJS có một số module phụ trợ cho Node (như `fs`). Trong `next.config.mjs`, thêm cấu hình fallbacks để bundler bỏ qua các module này trên client:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     webpack: (config, { isServer }) => {
       if (!isServer) {
         config.resolve.fallback = {
           ...config.resolve.fallback,
           fs: false,
           path: false,
           crypto: false,
         };
       }
       return config;
     },
   };
   export default nextConfig;
   ```

---

## 5. Cấu trúc thư mục dự án Next.js App Router

```text
reconciler-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout với font chữ và theme
│   │   ├── page.tsx             # Trang chính chứa luồng đối soát ('use client')
│   │   └── globals.css          # Tailwind CSS và shadcn variables
│   ├── components/
│   │   ├── ui/                  # Các component của shadcn (button, card, tabs, dialog...)
│   │   ├── upload/              # FileDropzone.tsx, PreviewTable.tsx
│   │   ├── mapping/             # ColumnSelector.tsx, ToleranceConfig.tsx
│   │   └── results/             # SummaryMetrics.tsx, DiscrepancyTable.tsx
│   ├── lib/
│   │   ├── parser.ts            # Đọc .xlsx (exceljs) và .csv (papaparse)
│   │   ├── reconciler.ts        # Thuật toán chuẩn hóa chuỗi và so khớp 1-1
│   │   ├── exporter.ts          # Tạo tệp báo cáo Excel 4 sheet có highlight màu
│   │   └── utils.ts             # cn() helper của shadcn
│   └── types/
│       ├── spreadsheet.ts       # Type cho Row, Column, WorkbookData
│       └── reconcile.ts         # Type cho MatchStatus, DiffRow
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 6. Hướng dẫn khởi tạo dự án nhanh (Copy-Paste Terminal)

### Bước 1: Khởi tạo Next.js với App Router & Tailwind
```bash
npx create-next-app@latest reconciler-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd reconciler-app
```

### Bước 2: Cài đặt các thư viện lõi
```bash
npm install exceljs papaparse big.js file-saver lucide-react clsx tailwind-merge
npm install -D @types/papaparse @types/big.js @types/file-saver
```

### Bước 3: Khởi tạo shadcn/ui để AI sinh giao diện cực đẹp
```bash
npx shadcn@latest init
# Chọn Default style, Slate hoặc Neutral color base

# Cài đặt các UI primitives thường dùng cho bảng tính:
npx shadcn@latest add button card tabs select input table badge
```

---

## 7. Tài liệu tham khảo chính thức

* [Next.js App Router Documentation](https://nextjs.org/docs/app)
* [shadcn/ui Documentation](https://ui.shadcn.com/)
* [GitHub ExcelJS](https://github.com/exceljs/exceljs)
* [PapaParse Documentation](https://www.papaparse.com/)
* [Big.js Documentation](https://mikemcl.github.io/big.js/)

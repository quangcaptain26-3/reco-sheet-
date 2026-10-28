# NHẬT KÝ TIẾN ĐỘ & TRẠNG THÁI DỰ ÁN (UPDATE.md)
## Dự án: Smart Sheet Reconciler (RecoSheet)
**Tệp quản lý trạng thái sống (Living Status Journal)**  
*Quy tắc bắt buộc: Mọi AI Agent trước khi thực thi prompt PHẢI ĐỌC tệp này để nắm ngữ cảnh, và sau khi hoàn thành task PHẢI CẬP NHẬT kết quả, bằng chứng test và việc cần làm tiếp theo.*

---

## 1. TỔNG QUAN PHIÊN LÀM VIỆC HIỆN TẠI (CURRENT STATE)

* **Giai đoạn hiện tại (Current Phase)**: `PUSHED — CI GREEN — READY FOR v1.0.0 TAG`
* **Task đang thực hiện (In-Progress Task)**: `Chờ tag v1.0.0 / deploy Vercel`
* **Trạng thái Build & Test gần nhất**:
  * TypeScript Typecheck: `PASS — exit 0 (next typegen + tsc)`
  * ESLint: `PASS — exit 0 (0 error, 0 warning)`
  * Vitest Suite: `PASS — 6 files / 59 tests, exit 0`
  * Next.js Build: `PASS — exit 0 (local standalone mặc định, Docker static export)`
  * Docker: `PASS — static image healthy, 20.7 MB compressed`
  * GitHub Actions: `PASS — CI run a6660ac (lint/typecheck/test/build)`
* **Môi trường**: Next.js 16.4.3 App Router (TypeScript strict, Tailwind CSS v4, shadcn/ui base-nova trên Base UI, React 19.3, Node >= 22)
* **Trạng thái Zero-Server**: `PASS — 0 API route, 0 fetch/XHR, 16 static GET, 0 POST/PUT`

---

## 2. NHẬT KÝ THỰC THI (EXECUTION LOG - MỚI NHẤT LÊN ĐẦU)

### [2026-10-28 22:40] - CI FIX · `next typegen` trước typecheck
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash).
* **Vấn đề**: CI đầu tiên (`8308535`) fail ở bước Typecheck. Nguyên nhân: `next-env.d.ts` bị ignore theo docs Next 16, nên clean clone không có file này và `LayoutProps` chưa được sinh; local pass vì file đã tồn tại.
* **Tái hiện**: worktree sạch + junction `node_modules`, chạy `npx tsc --noEmit` → `src/app/layout.tsx(22,50): error TS2304: Cannot find name 'LayoutProps'`.
* **Sửa**: đổi script `typecheck` thành `next typegen && tsc --noEmit` trong `package.json`. `next typegen` tạo route types/`next-env.d.ts` trước khi tsc; đã test trong worktree sạch → exit 0.
* **Commit/push**: `a6660ac fix(ci): generate Next route types before typecheck`.
* **Kết quả**: GitHub Actions run `a6660ac` → **success** toàn bộ: Install → Lint → Typecheck → Unit tests → Production build.
* **Việc tiếp theo**: tag `v1.0.0`, deploy Vercel/Docker smoke test.

### [2026-10-28 22:35] - RELEASE · Kiểm tra .gitignore, commit từng nhóm và push GitHub
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash).
* **`.gitignore`**:
  * Giữ chuẩn Next.js: `node_modules`, `.next`, `out`, `.env*`, `.vercel`, `*.tsbuildinfo`, `next-env.d.ts`.
  * Thêm `/.impeccable/live/` và `/.impeccable/critique/` (state local); giữ `.impeccable/design.json` để track.
* **Commit**: chia **19 commit** theo từng lớp, không commit gộp:
  * `chore: ignore local impeccable state`
  * `chore(deps): add runtime, UI and test dependencies`
  * `chore(build): configure standalone output and client Excel bundling`
  * `test(config): add Vitest configuration`
  * `feat(types): define spreadsheet and reconciliation contracts`
  * `feat(engine): add normalizer, matcher, parser and exporter`
  * `test(engine): add engine unit tests`
  * `feat(ui): add shadcn primitives, layout and shared components`
  * `feat(ui): add upload, mapping, dashboard and results`
  * `feat(hooks): add upload, reconciliation and export hooks`
  * `feat(app): wire the four-step reconciliation wizard`
  * `chore(samples): add demo spreadsheets and generator`
  * `test: add fixtures, integration and release acceptance tests`
  * `build(docker): add static nginx and standalone container setup`
  * `ci: add GitHub Actions quality pipeline`
  * `docs: add product truth and design system`
  * `docs: add release checklist and project journal`
  * `docs: add detailed README and agent skills`
  * `docs: add product requirements, architecture and implementation plans`
* **Push**:
  * `git branch -M main`
  * `git remote add origin https://github.com/quangcaptain26-3/reco-sheet-.git`
  * `git push -u origin main` → **exit 0**, new branch `main`
  * Remote: public repo, default branch `main`, HEAD `ad12e26`.
  * GitHub Actions: run **CI** đang `in_progress` cho SHA `ad12e26`.
* **Trạng thái**: working tree clean; Docker `recosheet` vẫn **healthy** tại `http://localhost:3000`.
* **Việc tiếp theo**: chờ CI xanh → tag `v1.0.0` → deploy Vercel/Docker smoke test.

### [2026-10-28 22:24] - DOCS · README chi tiết + Checklist phát hành
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash).
* **Đã làm**:
  * Viết lại `README.md` theo hướng onboarding cho người mới: ý tưởng/vấn đề, 3 persona, 4 bước sử dụng, thuật toán, kiến trúc, tech stack, yêu cầu hệ thống, cài đặt local, Docker static/standalone, dữ liệu mẫu, test/CI, bảo mật zero-server, giới hạn/roadmap, GitHub/Vercel.
  * Thêm mục **“Agent Skills đã sử dụng”** liệt kê đúng các skill trong prompt Phase 1 → 5 và Final Review, kèm cách áp dụng; bổ sung `impeccable` (init/document/critique/polish/doctor) như skill ngoài prompt Phase.
  * Tạo `RELEASE.md`: quality gate cuối, vệ sinh Git, tạo repo/push, CI, deploy Vercel, deploy Docker VPS, smoke test AC, tag `v1.0.0`, rollback, việc còn treo và các điều không được làm.
  * README liên kết tới `RELEASE.md`, `PRODUCT.md`, `DESIGN.md`, `UPDATE.md` và `docs/`.
* **Không thay đổi**: source code, dependency, container. Không chạy lại build/test vì docs-only; trạng thái 59/59 tests và Docker healthy giữ nguyên.
* **Việc tiếp theo**: chủ dự án tạo GitHub repo trống → `git branch -M main` → `git add .`/commit → `git remote add origin`/push → kiểm tra CI → Vercel/Docker smoke test → tag `v1.0.0`.

### [2026-10-28 22:18] - DOCKERIZE · Static nginx 20.7 MB + Node standalone fallback
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash).
* **Quyết định kiến trúc**:
  * App 100% client-side, không API route → image mặc định dùng **Next static export + nginx:1.27-alpine**, không mang Node runtime.
  * `next.config.ts` thêm `NEXT_OUTPUT=export`: chỉ chế độ này dùng `output: "export"` và tắt tạm `cacheComponents`/`partialPrefetching` (PPR không hỗ trợ export mode). Build local/CI mặc định vẫn là `standalone` + Cache Components.
  * Giữ `Dockerfile.standalone` làm fallback nếu sau này cần server-side Next.js features.
* **Tệp đã tạo**:
  * `Dockerfile` — multi-stage Node 22 Alpine builder → nginx 1.27 Alpine runner; chỉ copy `out/` + `nginx.conf`; healthcheck `wget`; `STOPSIGNAL SIGQUIT`.
  * `Dockerfile.standalone` — Node standalone fallback, chạy user `node`, healthcheck, `server.js`.
  * `.dockerignore` — loại `node_modules`, `.next`, `out`, tests, docs, design artifacts, env/log; giữ `public` + source cần build.
  * `docker-compose.yml` — port `3000:80`, `init: true`, `restart: unless-stopped`, `no-new-privileges`; healthcheck từ image.
  * `nginx.conf` — gzip, immutable cache cho `/_next/static`, cache 7 ngày cho sample/font, security headers (`nosniff`, `DENY`, referrer policy), SPA fallback.
* **Bằng chứng kiểm tra**:
  * `npm run build` (mặc định, standalone) → **exit 0**
  * `NEXT_OUTPUT=export npm run build` → **exit 0**; `out/` = **2.02 MB**
  * `docker build` static → **exit 0**; image `recosheet:1.0.0`:
    * **20.7 MB compressed** (`docker image inspect`), 76.6 MB uncompressed trong Docker Desktop
    * `du -sh /usr/share/nginx/html` = **2.2 MB**
  * `docker build -f Dockerfile.standalone` → **exit 0**; image `recosheet:1.0.0-node` = **74.5 MB compressed** / 311 MB uncompressed; container test HTTP 200, health **healthy**, user **node**.
  * Container static: **healthy**, HTTP `/` = 200, `/sample-data/sample_bank_statement.csv` = 200, security headers đúng
  * Browser E2E trong container static: upload `.xlsx` + `.csv`, đối soát **8/2/2/2**, Δ `-95.000`, export Excel thành công; console sạch
  * Runtime: **11.45 MiB RAM**, CPU ~0.01% khi idle
  * `docker compose config --quiet` exit 0; `docker compose up -d` → container **healthy** tại `http://localhost:3000`
* **Trạng thái**: Docker image mặc định đang chạy; **RELEASED READY 1.0** giữ nguyên.

### [2026-10-28 22:08] - MAINTENANCE · Làm mới `.impeccable/design.json`
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash).
* **Bối cảnh**: `impeccable context` báo `design-sidecar-stale` — `DESIGN.md` được sửa sau khi sidecar được tạo (thêm type role `support` 13px).
* **Đã làm**:
  * Giữ nguyên `DESIGN.md` (không overwrite), chỉ regenerate `.impeccable/design.json`.
  * Cập nhật `generatedAt` sang thời điểm hiện tại.
  * Thêm `extensions.typographyMeta.support` để panel/lint thấy role 13px đang dùng thật trong UI.
  * Giữ nguyên 23 `colorMeta`, 3 shadows, 4 motion, 4 breakpoints, 10 component snippets và narrative hiện có.
  * Xác nhận JSON hợp lệ.
* **Bằng chứng**:
  * `impeccable doctor --json` → **exit 0**, `findings: []` (không còn `design-sidecar-stale`).
  * Không thay đổi UI, source, dependency hay test.
* **Trạng thái**: artifact design system đã đồng bộ; **RELEASED READY 1.0** giữ nguyên.

### [2026-10-28 22:06] - POLISH PASS · Trust trail, modal focus, empty state, validation
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash), theo `critique` snapshot `2026-10-28T14-56-18Z__src-app-page-tsx.md`.
* **Phạm vi đã chọn**: 2 P1 + 3 P2 + các minor có bằng chứng; giữ nguyên visual world "Reconciliation Desk".
* **Thay đổi chính**:
  * **Result trust trail**: `SummaryCards` thêm verdict `Chưa khớp / Khớp toàn bộ`, strip “Thiết lập đã dùng” từ `result.config` (cột khóa/giá trị, dung sai, 3 cleaning flags), đưa tổng Δ `-95.000` thành metric chính và đổi “Đã phân tích 24 dòng” → “Đã đối chiếu 10 cặp khóa”.
  * **Raw-key audit**: `matcher.rawText` giữ nguyên khoảng trắng gốc; `DiffTable` hiện `Gốc: “ ORD-101 ”` thay vì suppress.
  * **Exporter**: sheet `Tổng quan` ghi đủ 3 cleaning flags; sheet `Khớp hoàn toàn` thêm `Mã gốc A` / `Mã gốc B`.
  * **Modal**: focus trap Tab/Shift+Tab, `inert` page root, restore focus về nút “Xem trước”, `aria-describedby`.
  * **First-run**: step 2 collapse đến khi có tệp (page 1651 → 1178px; card 650 → 278px); nút Chọn tệp A/B trong trạng thái rỗng.
  * **Validation**: Run disabled đến khi đủ 2 cột khóa; hint/`aria-invalid` tại select thiếu; `ToleranceInput` nhận field-level error; bỏ `.xls` khỏi file picker; confirm trước “Xoá tất cả”; “Đối soát lại” chạy lại thật.
  * **Consistency**: file B giữ sky accent; CSV không còn bị gọi là sheet; bỏ X native trùng; empty-search copy riêng; table có `<caption>` + `scope`; run 36px; English chrome (“Zero-Server”, “Smart Sheet Reconciler”, “Auto-Trim”, “hash map”) chuyển sang tiếng Việt; 10px tagline/lock line lên 11px; KPI caption tăng contrast.
  * **DESIGN.md**: thêm type role `support` 13px (đang dùng thật trong UI) để detector không coi là drift.
* **Bằng chứng kiểm tra**:
  * `npx tsc --noEmit` → **exit 0**
  * `npm run lint` → **exit 0**
  * `npx vitest run` → **exit 0 — 6 files / 59 tests**
  * `npm run build` → **exit 0 — route `/` static**
  * Browser 1440/1280: verdict + provenance + Δ hierarchy đúng; `Gốc: “ ORD-101 ”`; focus trap giữ trong dialog, Escape trả focus về “Xem trước”; network **17 GET, 0 xhr/fetch**.
  * Export mới đọc lại bằng openpyxl: 5 sheet; `Làm sạch dữ liệu = Tự cắt: Bật · Hoa/thường: Bật · Bỏ dấu: Tắt`; `Khớp hoàn toàn` có `Mã gốc A/B`.
  * Detector: **3 advisory** còn lại đều là documented exception (hero 15px; 10px raw hint/tab count trong 11px row), không có lỗi mới.
  * Critique snapshot đã **close** (`critique-storage close` exit 0).
* **Còn lại (không chặn release)**: preview number alignment, token names `verify/compare/caution/alarm` chưa thành CSS variables, `.impeccable/design.json` sidecar stale; deploy Vercel cần quyền tài khoản.

### [2026-10-28 21:38] - DESIGN SYSTEM · GHI NHẬN DESIGN.md (impeccable document)
* **Người thực hiện / Agent**: Design Context Agent (skill `impeccable`, lệnh `document`, Scan mode).
* **Bối cảnh**: `PRODUCT.md` đã có, `DESIGN.md` chưa; quét giao diện hiện hữu trong code thay vì sáng tác hệ thống mới. Không sửa UI, source hay dependency.
* **Đã tạo**:
  * `DESIGN.md` — frontmatter 23 màu OKLCH, 7 type role, thang radius/spacing, token component; 8 section chuẩn: Overview · Colors · Typography · Layout · Elevation & Depth · Shapes · Components · Do's and Don'ts.
  * `.impeccable/design.json` — `schemaVersion: 2`; `colorMeta` kèm tonal ramp, typographyMeta, shadows/motion/breakpoints; 10 component drop-in; narrative đồng bộ với DESIGN.md.
* **Nội dung đã chốt**: hướng "The Reconciliation Desk" — plain/exact, flat với hairline ring; palette neutral incumbent + 4 tín hiệu cố định (emerald verify, sky file B, amber discrepancy, rose only-in-A); Geist, phân cấp bằng size/weight/tracking; layout 1152px, header 56px, bảng 540px, 50 dòng/trang; workbook Excel là surface riêng (navy header, pale status rows, red Δ).
* **Ghi chú trung thực**: `.dark` trong `globals.css` là dormant (không có toggle); Geist Mono khai báo nhưng chưa dùng trong UI; không bịa palette/typography ngoài code hiện có.
* **Không thay đổi**: 0 file UI/source/dependency; không chạy lại build/test vì docs-only. Trạng thái **RELEASED READY 1.0** giữ nguyên.
* **Việc tiếp theo**: review `DESIGN.md`; nếu muốn cải thiện giao diện, chạy `critique` (đánh giá) hoặc `polish` (chỉnh có phạm vi).

### [2026-10-28 21:28] - DESIGN CONTEXT · KHỞI TẠO PRODUCT.md (impeccable init)
* **Người thực hiện / Agent**: Design Context Agent (skill `impeccable`, lệnh `init`).
* **Bối cảnh**: Dự án chưa có PRODUCT.md nên mọi luồng thiết kế mới (shape/new-work) bị chặn. Lượt này chỉ ghi nhận sự thật sản phẩm, không sửa mã nguồn, không đổi UI/dependency.
* **Đã tạo**:
  * `PRODUCT.md` (schema `impeccable:product-schema 1`) — platform `web`; 3 persona (kế toán đối soát, vận hành TMĐT, logistics/XNK); mục tiêu và định vị (zero-server dẫn dắt, làm sạch dữ liệu bẩn, Big.js, báo cáo Excel hoàn chỉnh); operating context (sao kê, sổ quỹ, báo cáo đối tác); capabilities/constraints (10MB, < 30.000 dòng, chỉ sheet đầu, `.xls` không hỗ trợ, stack cố định, danh sách deferred); brand (RecoSheet, giao diện tiếng Việt); evidence & các khoảng trống không được bịa (không testimonial/khách hàng/số liệu sử dụng/chứng nhận); 5 nguyên tắc sản phẩm; accessibility.
  * `.impeccable/live/config.json` — live mode cho Next.js App Router (`src/app/layout.tsx`, anchor `</body>`, `commentSyntax: jsx`); `detect-csp` trả về `null` nên `cspChecked: true`, không sửa CSP.
* **Xác nhận từ chủ dự án**: sản phẩm public self-serve; giao diện tiếng Việt only và tên RecoSheet là ràng buộc cố định cho v1. Trọng số khác biệt được giao cho agent chọn — chốt theo PRD mục 5.1: zero-server là ưu tiên cao nhất, ba cơ chế còn lại là phần làm nó hữu dụng.
* **Không thay đổi**: 0 file mã nguồn, 0 dependency, 0 thay đổi UI. Không chạy lại build/test vì phạm vi chỉ là tài liệu + config.
* **Việc tiếp theo**: `/impeccable document` nếu muốn ghi lại hệ thống giao diện hiện có thành DESIGN.md, hoặc đi thẳng vào refinement có phạm vi (`polish`/`critique`).

### [2026-10-28 21:22] - FINAL REVIEW · RELEASED READY 1.0
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash)
* **Bối cảnh**: Rà soát toàn diện trước phát hành theo 6 Acceptance Criteria của `PROJECT-BLUEPRINT.md`; chạy lại kiểm tra trên production build cuối cùng.
* **Thay đổi trong lượt review**:
  * Thêm `tests/release-acceptance.test.ts` — test end-to-end trên chính dữ liệu mẫu `public/sample-data` cho AC-01 → AC-05.
  * Bổ sung assertion `ORD-001 ` → `ord-001` đúng checklist AC-02.
  * Dọn dòng thừa `void extension;` trong `src/lib/engine/parser.ts`.
  * Thêm `engines.node >= 22` trong `package.json` để đồng bộ với CI.
* **AC Matrix (bằng chứng cụ thể)**:
  * **AC-01 (PASS)**: test acceptance parse `.xlsx` + `.csv` mẫu → **37.6ms** (< 2s); cột hiển thị đúng `Mã đơn, Khách hàng, Số tiền, Ngày ghi nhận, Ghi chú` và `Mã giao dịch, Số tiền, Ngày, Diễn giải`; UI hiển thị 12 dòng/5 cột và 12 dòng/4 cột.
  * **AC-02 (PASS)**: `normalizeKey(" ORD-001 ", autoTrim+caseInsensitive)` → `ord-001`; test mẫu `" ORD-101 "` ↔ `"ord-101"` được ghép cặp trong kết quả.
  * **AC-03 (PASS)**: `1,000,000` vs `900,000` → tab "Lệch giá trị", `delta = "-100000"`, không có sai số floating-point (Big.js).
  * **AC-04 (PASS)**: `onlyInA = ["ord-107","ord-111"]`, `onlyInB = ["ord-113","ord-114"]`; UI có tab tương ứng.
  * **AC-05 (PASS)**: báo cáo tải về **1 sheet Tổng quan + 4 sheet kết quả**; đọc độc lập bằng **ExcelJS** và **openpyxl 3.1.5**:
    * Sheets: `Tổng quan | Lệch giá trị | Chỉ có ở A | Chỉ có ở B | Khớp hoàn toàn`
    * Dòng lệch fill `FFFFF2CC` (cam), ô Δ `-100000` font `FFC00000` (đỏ)
    * File OOXML hợp lệ, mở được bằng ExcelJS/openpyxl; kích thước 12,311 bytes.
  * **AC-06 (PASS)**: Zero-Server audit trên production build — **16 request, 100% GET static**, `xhr/fetch = 0`, không POST/PUT; static scan: 0 API route, 0 `fetch`/`sendBeacon`/XHR trong `src/`.
* **Chất lượng & UX**:
  * Lighthouse (desktop snapshot): **Accessibility 100 · Best Practices 100 · SEO 100 · Agentic Browsing 100** — 36/36 audit pass.
  * `npm ci --dry-run --ignore-scripts` → **exit 0** (CI reproducible).
  * Không còn TODO/FIXME/console.log; `git diff --check` → exit 0.
* **Kiểm chứng cuối cùng**:
  * `npm run lint` → **exit 0** (0 warning, 0 error)
  * `npx tsc --noEmit` → **exit 0**
  * `npx vitest run` → **exit 0 — 6 files / 59 tests passed**
  * `npm run build` → **exit 0** — route `/` static
  * Chain `lint && tsc && vitest && build` → **exit 0**
* **Kết luận**: Toàn bộ AC-01 → AC-06 đạt. Dự án chuyển trạng thái **RELEASED READY 1.0**.
* **Duy nhất còn lại**: Deploy Vercel (cần quyền tài khoản) — không ảnh hưởng trạng thái release artifact.

### [2026-10-28 21:17] - Phase 5 Audit: Zero-Server · Performance · CI · Cleanup
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash)
* **Bối cảnh**: Đọc `UPDATE.md` sau Phase 4; chạy lại toàn bộ audit trên production build cuối cùng. Không thêm dependency, không đổi kiến trúc.
* **Task 5.1 — Zero-Server Audit (PASS)**:
  * Static: `src/app/**/route.ts` → **NONE**; tìm `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `axios`, URL http(s) trong `src/` → **NONE**.
  * Browser (Chrome DevTools, production build): upload `.xlsx` + `.csv`, chạy đối soát và xuất Excel → **16 network request, tất cả GET static** (document, fonts, CSS, JS chunks, favicon); **`xhr/fetch = 0`**, không có POST/PUT; console sạch.
  * Kết luận: không có payload bảng tính nào rời trình duyệt; đạt AC-06.
* **Task 5.2 — Performance Audit (PASS)**:
  * Test `matcher.test.ts > reconciles 10,000 rows in under 2 seconds` → **90ms** (ngưỡng < 2000ms), 16/16 tests của file pass.
  * Thuật toán hash map 1-1 `O(N+M)`; bảng kết quả phân trang 50 dòng/lần render.
* **Task 5.3 — CI Pipeline (PASS)**:
  * `.github/workflows/ci.yml`: trigger `push` (mọi nhánh) + `pull_request`, `permissions: contents: read`, concurrency cancel-in-progress.
  * Node.js 22, `npm ci` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`.
  * `npm ci --dry-run --ignore-scripts` → **exit 0** (lockfile đồng bộ, bước install của CI hợp lệ).
* **Task 5.4 — Cleanup & Lint (PASS)**:
  * `npm run lint` → **exit 0, 0 error / 0 warning**.
  * Không còn `TODO`/`FIXME`/`console.log` trong `src/`; logger chỉ log số liệu tổng hợp.
  * `git diff --check` → exit 0 (chỉ cảnh báo LF/CRLF của Git, không có whitespace error).
  * Engine vẫn pure: không import React/Next (`NONE`).
* **Bằng chứng kiểm tra (Test Evidence)**:
  * `cmd /c "npm run lint && npx vitest run && npm run build"` → **CHAIN_EXIT=0**
    * ESLint: exit 0
    * Vitest: 5 files / **56 tests passed**
    * Build: thành công, route `/` static
  * `npx tsc --noEmit` → **exit 0**
  * Benchmark 10k: **90ms** (test), browser 24 dòng: **7ms**
  * Zero-server network: **16/16 GET**, `xhr/fetch=0`
* **Kết luận**: Phase 5 đạt toàn bộ tiêu chí local; **sẵn sàng chạy Final Review**. Deploy Vercel vẫn cần quyền tài khoản.

### [2026-10-28 21:15] - Xác minh Phase 4 (UI Engineering) theo yêu cầu
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash)
* **Bối cảnh**: Đọc `UPDATE.md` sau Phase 3 để nắm state interface. Phase 4 đã được triển khai trong phiên trước; lượt này rà soát đúng danh sách component, kiểm tra kết nối wizard và chạy production build.
* **Danh mục component đã xác minh**:
  * **Upload**: `DropzoneArea.tsx` (drag & drop + click, hidden file input, spinner, lỗi inline, overlay khi kéo), `FileCard.tsx` (tên, dung lượng, số dòng/cột, preview/remove/replace), `PreviewDataModal.tsx` (portal, `role="dialog"`, `aria-modal`, Escape, scroll lock, 5 dòng đầu).
  * **Mapping**: `ColumnSelector.tsx` (Base UI Select, disabled khi chưa có tệp), `ToleranceInput.tsx` (số không âm, hiển thị đơn vị), `CleanOptionsToggle.tsx` (3 switch: Auto-Trim, case-insensitive, bỏ dấu phân cách).
  * **Dashboard**: `SummaryCards.tsx` (4 KPI + meta dòng/thời gian), `DiscrepancyBadge.tsx` (Δ có dấu, màu theo chiều lệch).
  * **Results**: `ResultTabs.tsx` (controlled bởi `useReconciler`), `DiffTable.tsx` (**highlight cam `bg-amber-50/45`**, badge Δ, empty state, phân trang **50 dòng/trang**), `TableSearchFilter.tsx`, `ExportButton.tsx` (loading state).
  * **Layout/Shared**: `Header.tsx`, `Footer.tsx`, `StepHeading.tsx`, `InlineAlert.tsx`.
  * **Page**: `src/app/page.tsx` nối Wizard 4 bước Upload → Mapping → Run → Results, privacy banner, link tệp mẫu, reset/làm mới.
* **Đánh giá UI/UX**:
  * Desktop responsive (`max-w-6xl`), typography Geist thống nhất, màu trạng thái: emerald (khớp), amber (lệch), rose/sky (thiếu A/B).
  * Accessibility: label + `htmlFor`, `aria-label`, `role="alert"`, `aria-live`, switch `role="switch"`, nút có title/aria.
  * Zero-Server copy hiển thị rõ ở hero, dropzone, footer.
* **Bằng chứng kiểm tra (Test Evidence)**:
  * `npm run build` → **exit 0** — Turbopack, route `/` static, không API route.
  * `npx tsc --noEmit` → **exit 0**
  * `npm run lint` → **exit 0**
  * `npx vitest run` → **exit 0** — 56/56 tests
  * **Browser E2E (Chrome DevTools, production build)**: upload 2 tệp mẫu → **8 khớp / 2 lệch / 2 chỉ A / 2 chỉ B**, Δ `-95.000`, 2ms; tab + search `107` → 1/2 dòng; preview modal 5 dòng; export Excel 5 sheet; console sạch; `xhr/fetch = 0`.
  * **Visual check 1440px**: hero, dropzone, mapping, KPI cards, tab bar và bảng kết quả hiển thị đúng, không tràn layout.
* **Kết luận**: Phase 4 hoàn tất; giao diện sẵn sàng cho **Phase 5 Audit**.

### [2026-10-28 21:13] - Xác minh Phase 3 (Custom Hooks) + chuẩn hóa tầng lọc
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash)
* **Bối cảnh**: Đọc `UPDATE.md` và API Core Engine trước khi thực thi. 3 hook đã tồn tại từ phiên trước; lượt này rà soát và **chuyển logic lọc tab/search từ `ResultTabs` vào `useReconciler`** để đúng phạm vi Task 3.2 và đúng kiến trúc "UI chỉ hiển thị".
* **Thay đổi mã nguồn**:
  * `src/hooks/useReconciler.ts`: bổ sung `activeTab`, `setActiveTab`, `search`, `setSearch`; expose `activeTabRecords` và `filteredRecords` qua **`useMemo`**; reset tab/search khi chạy lại hoặc `reset()`; giữ `elapsedMs` benchmark và `runId`.
  * `src/components/results/ResultTabs.tsx`: bỏ state/filter nội bộ, nhận `activeTab`, `onTabChange`, `search`, `onSearchChange`, `filteredRecords` qua props; component còn thuần hiển thị.
  * `src/app/page.tsx`: truyền selector từ hook xuống `ResultTabs`; bỏ `key={result.runId}` không cần thiết.
* **Nội dung đã xác minh**:
  * **Task 3.1 — `useFileUpload`**: quản lý slot A/B, validate extension + 10MB, gọi `parseSpreadsheetFile`, giữ `sheet.preview` 5 dòng, bắt `SpreadsheetParseError` → message thân thiện, chống race bằng request id.
  * **Task 3.2 — `useReconciler`**: nhận `rowsA/rowsB/config`, yield 1 frame để spinner kịp paint, đo `performance.now()` → `elapsedMs`, gọi `reconcileRows`, lưu `runId`; lọc tab/search bằng `useMemo`; xử lý lỗi config/runtime.
  * **Task 3.3 — `useExportExcel`**: gọi `createReconciliationReport`, dynamic import `file-saver`, tải Blob tên `Bao-cao-doi-soat-YYYY-MM-DD.xlsx`, quản lý `isExporting/error`.
* **Bằng chứng kiểm tra (Test Evidence)**:
  * `npx tsc --noEmit` → **exit 0**
  * `npm run lint` → **exit 0**
  * `npx vitest run` → **exit 0** — 5 files / 56 tests (engine 54 + fixture integration 2)
  * `npm run build` → **exit 0** — route `/` static, không API route
  * **Browser E2E (Chrome DevTools, production build)**: upload 2 tệp mẫu → chọn cột → **8 khớp / 2 lệch / 2 chỉ A / 2 chỉ B**, `Δ = -95.000`, `elapsedMs = 2ms`; chuyển tab "Chỉ có ở A"; search `107` → **1/2 dòng**; cột chênh lệch one-sided hiển thị `—`; console sạch; `xhr/fetch = 0`.
* **Kết luận**: Task 3.1 → 3.3 đạt tiêu chí nghiệm thu; **Phase 3 hoàn tất, hooks sẵn sàng cho UI Phase 4**.

### [2026-10-28 21:09] - Xác minh Phase 2 (Core Engine, TDD) theo yêu cầu
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash)
* **Bối cảnh**: Đọc `UPDATE.md` trước khi thực thi. Phase 2 đã được triển khai trong phiên trước; lượt này rà soát lại toàn bộ engine, bổ sung assertion `(50,000) → -50000` cho đúng phạm vi Task 2.1.
* **Ràng buộc kiến trúc đã kiểm tra**:
  * `src/lib/engine/` chỉ chứa `normalizer.ts`, `matcher.ts`, `parser.ts`, `exporter.ts` — **không có JSX, không import React/hooks/Next** (regex audit `from "react" | "next" | "@/components" | "@/hooks"` → `NONE`).
  * Dependency engine: `big.js`, `papaparse`, types nội bộ (`../../types/*`).
* **Nội dung đã xác minh**:
  * **Task 2.1 — Normalizer**: Auto-Trim, gộp khoảng trắng, bỏ zero-width/NBSP, case-insensitive, tùy chọn bỏ `- . _ /`; parse tiền `1,000,000`, `1.000.000`, `1.250,50 đ`, `(50,000)`, `(1,500,000)`, `15.000-`; so sánh tolerance bằng Big.js.
  * **Task 2.2 — Matcher**: hash map 1-1 `O(N+M)`, ghép khóa trùng theo thứ tự, `Δ = B − A` chính xác, tolerance `±X`, 4 nhóm kết quả, duplicate key, bỏ dòng khóa trống, benchmark 10.000 dòng.
  * **Task 2.3 — Parser**: ExcelJS (`.xlsx`, sheet đầu tiên, header trùng) + PapaParse (`.csv`, BOM, UTF-16, auto delimiter); lỗi có mã `SpreadsheetParseError`; chặn file hỏng/rỗng/quá 10MB/.xls BIFF.
  * **Task 2.4 — Exporter**: ExcelJS dynamic import; workbook **1 sheet Tổng quan + 4 sheet kết quả** (đúng PRD "4 sheet kết quả"); header `FF1F4E78`, dòng lệch `FFFFF2CC`, delta đỏ `FFC00000`, freeze pane, auto filter, empty state, chống formula injection.
* **Bằng chứng kiểm tra (Test Evidence)**:
  * `npx vitest run src/lib/engine/__tests__/` → **exit 0** — 4 test files, **54/54 tests passed**
    * `normalizer.test.ts` → 15 tests (bao gồm assertion `(50,000)`)
    * `matcher.test.ts` → 16 tests (gồm benchmark 10k)
    * `parser.test.ts` → 16 tests
    * `exporter.test.ts` → 7 tests
  * `npx tsc --noEmit` → **exit 0**
  * `npx vitest run` toàn bộ → **exit 0** — 5 files / 56 tests (bao gồm fixture integration)
* **Kết luận**: Task 2.1 → 2.4 đạt tiêu chí nghiệm thu; **Phase 2 hoàn tất và sẵn sàng cho Phase 3**.

### [2026-10-28 21:12] - Xác minh Phase 1 (Foundation & Domain Contracts) theo yêu cầu
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash)
* **Bối cảnh**: Đọc `UPDATE.md` trước khi thực thi. Phase 1 đã được triển khai trong phiên trước; lượt này rà soát lại đúng phạm vi yêu cầu, không sửa mã nguồn.
* **Nội dung đã xác minh**:
  * `src/types/spreadsheet.ts`: có `RowData`, `ColumnSchema`, `ParsedSheet`, `SpreadsheetParseError` (kèm `CellValue`, `SpreadsheetFileLike`, `SpreadsheetErrorCode`, giới hạn 10MB).
  * `src/types/reconciliation.ts`: có `MatchStatus`, `ReconcileConfig`, `DiffRecord`, `ReconcileSummary` (kèm `DuplicateKeySummary`, `ReconcileResult`, `ReconciliationResult`).
  * `src/components/ui/`: đủ 7 primitive được yêu cầu — `button`, `card`, `tabs`, `table`, `select`, `input`, `badge`; tất cả đều export component/variant hợp lệ.
  * `next.config.ts`: Webpack fallbacks `fs`, `path`, `crypto` vẫn hiện diện.
  * Không có thay đổi scope, không thêm dependency.
* **Bằng chứng kiểm tra (Test Evidence)**:
  * `npx tsc --noEmit` → **exit 0**
  * `npx vitest run` (phiên gần nhất) → **exit 0** — 5 files / 56 tests
  * `npm run lint` (phiên gần nhất) → **exit 0**
  * `npm run build` (phiên gần nhất) → **exit 0**
* **Kết luận**: Task 1.1 và Task 1.2 đạt đủ tiêu chí nghiệm thu; **Phase 1 hoàn tất và sẵn sàng cho Phase 2**.

### [2026-10-28 21:06] - Hoàn tất toàn bộ MVP (Phase 1 → Phase 5)
* **Người thực hiện / Agent**: Implementation Agent (DeepSeek V4.1 Flash)
* **Nội dung đã hoàn thành**:
  * **Phase 1**: `next.config.ts` có Webpack fallbacks (`fs`, `path`, `crypto`); domain contracts `src/types/spreadsheet.ts` và `src/types/reconciliation.ts` (không dùng `any`); kiểm tra đủ 7 shadcn primitives hiện có.
  * **Phase 2 (Core Engine — pure TS)**:
    * `normalizer.ts`: trim/gộp khoảng trắng, bỏ zero-width/NBSP, case-insensitive, tùy chọn bỏ dấu phân cách; parse tiền `1,000,000`, `1.000.000`, `1.250,50 đ`, `(1,500,000)`, `15.000-`.
    * `matcher.ts`: hash map 1-1 `O(N+M)`, ghép khóa trùng theo thứ tự, `Δ = B − A` bằng Big.js, tolerance tuyệt đối, phát hiện duplicate key, bỏ qua dòng khóa trống.
    * `parser.ts`: ExcelJS cho `.xlsx` (sheet đầu tiên) + PapaParse cho `.csv` (auto delimiter, BOM, UTF-16); chuẩn hóa header trùng; lỗi có mã (`SpreadsheetParseError`).
    * `exporter.ts`: dynamic import ExcelJS, workbook **5 sheet** (Tổng quan + 4 nhóm), header in đậm `FF1F4E78`, dòng lệch `FFFFF2CC`, delta đỏ `FFC00000`, freeze pane, auto filter, chống formula injection.
  * **Phase 3**: `useFileUpload` (chống race khi thay tệp), `useReconciler` (loading/error/elapsed/runId), `useExportExcel` (dynamic import `file-saver`).
  * **Phase 4**: đủ component Upload / Mapping / Dashboard / Results / Layout; wizard 4 bước tại `src/app/page.tsx`; modal xem trước accessible; bảng 4 tab + tìm kiếm + phân trang 50 dòng; responsive desktop.
  * **Phase 5**: audit zero-server, benchmark 10.000 dòng, lint/typecheck sạch, CI `.github/workflows/ci.yml`, `README.md`, dữ liệu mẫu + script sinh mẫu.
* **Bằng chứng kiểm tra (Test Evidence)**:
  * `npx tsc --noEmit` → **exit 0**
  * `npm run lint` → **exit 0** (0 error, 0 warning)
  * `npx vitest run` → **exit 0** — 5 test files, **56 tests passed** (normalizer, matcher, parser, exporter, fixture integration)
  * `npm run build` → **exit 0** — `Route (app) /` là static, không có API route
  * `npm run samples` → **exit 0** — sinh `public/sample-data/sample_internal_ledger.xlsx` (7.2KB) và `sample_bank_statement.csv` (0.6KB)
  * **Browser E2E (Chrome DevTools, production build)**: upload `.xlsx` + `.csv` mẫu, chọn `Mã đơn ↔ Mã giao dịch`, `Số tiền ↔ Số tiền`, tolerance 0 → **8 khớp / 2 lệch / 2 chỉ A / 2 chỉ B**, tổng Δ `-95.000`, thời gian **3ms**; tab, search `107`, modal preview hoạt động.
  * **Export E2E**: tải `Bao-cao-doi-soat-2026-10-28.xlsx` (12,311 bytes); đọc lại bằng ExcelJS: **5 sheet** `Tổng quan | Lệch giá trị | Chỉ có ở A | Chỉ có ở B | Khớp hoàn toàn`, header fill `FF1F4E78`, dòng lệch `FFFFF2CC`, ô delta `FFC00000`, giá trị `-100000`.
  * **Zero-Server audit**: 14 network request (document, font, CSS, JS, favicon) — **tất cả GET static**, `xhr/fetch = 0`, không có POST/PUT.
  * **Static audit**: `src/app/**/route.ts` = 0; `fetch(` trong `src/` = 0; engine chỉ import `big.js`, `papaparse`, types nội bộ.
* **Vấn đề / Ghi chú phát sinh**:
  * `exceljs` không đọc được `.xls` BIFF (Excel 97-2003). Parser phát hiện chữ ký OLE và báo lỗi thân thiện, hướng dẫn lưu lại `.xlsx`; **không cài thêm thư viện ngoài danh sách phê duyệt**.
  * Không cài `dialog` của shadcn (tránh thêm package): modal preview dùng portal + `role="dialog"`, `aria-modal`, Escape, focus management và scroll lock.
  * `pnpm/npm` lockfile không đổi dependency; chỉ bổ sung script `typecheck`, `test`, `test:watch`, `samples`.
  * `font-heading` từng fallback sang serif do biến `--font-sans` tự tham chiếu trong `globals.css`; đã sửa trỏ về `--font-geist-sans` (đã xác minh computed font = Geist).

---

## 3. CHECKLIST CÁC HẠNG MỤC (ACTIVE BACKLOG)

### Phase 1: Foundation & Types — HOÀN TẤT (xác minh lại 2026-10-28 21:12)
- [x] Task 1.1: Webpack client fallbacks + `src/types/spreadsheet.ts`, `src/types/reconciliation.ts` — đủ `RowData`, `ColumnSchema`, `ParsedSheet`, `SpreadsheetParseError`, `MatchStatus`, `ReconcileConfig`, `DiffRecord`, `ReconcileSummary`.
- [x] Task 1.2: Xác nhận shadcn primitives (`button`, `card`, `tabs`, `table`, `badge`, `select`, `input`); `dialog` thay bằng modal tự viết để không thêm package.
- [x] *Checkpoint 1*: `npx tsc --noEmit` → **exit 0** (xác minh lại).

### Phase 2: Core Engine (Pure TS) — HOÀN TẤT (xác minh lại 2026-10-28 21:09)
- [x] Task 2.1: `normalizer.ts` + `normalizer.test.ts` — **15 tests** (Auto-Trim, AC-02, số âm `(50,000)`, tiền tệ, dấu phân cách).
- [x] Task 2.2: `matcher.ts` + `matcher.test.ts` — **16 tests** (hash map 1-1, duplicate, tolerance, Big.js delta, benchmark 10k).
- [x] Task 2.3: `parser.ts` + `parser.test.ts` — **16 tests** (CSV/XLSX/BOM/delimiter/header trùng/file hỏng/file rỗng).
- [x] Task 2.4: `exporter.ts` + `exporter.test.ts` — **7 tests** (1 tổng quan + 4 kết quả, tô màu cam, empty state, formula injection).
- [x] *Checkpoint 2*: `npx vitest run src/lib/engine/__tests__/` → **exit 0 — 4 files / 54 tests passed (100%)**.

### Phase 3: Custom React Hooks — HOÀN TẤT (xác minh lại 2026-10-28 21:13)
- [x] Task 3.1: `useFileUpload.ts` — 2 slot A/B, parser, preview 5 dòng, bắt lỗi tệp hỏng, race-safe, validate 10MB/extension.
- [x] Task 3.2: `useReconciler.ts` — nhận config, gọi matcher, benchmark `elapsedMs`, `activeTab`/`search` + `filteredRecords` bằng `useMemo`.
- [x] Task 3.3: `useExportExcel.ts` — gọi exporter, dynamic import `file-saver`, tải `Bao-cao-doi-soat-[date].xlsx`.
- [x] *Checkpoint 3*: `npx tsc --noEmit` → **exit 0**; `npx vitest run` → **56/56**; `npm run build` → **exit 0**; browser E2E filter/tab PASS.

### Phase 4: UI Engineering — HOÀN TẤT (xác minh lại 2026-10-28 21:15)
- [x] Task 4.1: `DropzoneArea.tsx`, `FileCard.tsx`, `PreviewDataModal.tsx` (drag & drop, preview 5 dòng, keyboard/ARIA).
- [x] Task 4.2: `ColumnSelector.tsx`, `ToleranceInput.tsx`, `CleanOptionsToggle.tsx`; cảnh báo mã trùng lặp.
- [x] Task 4.3: `SummaryCards.tsx`, `DiscrepancyBadge.tsx`, `ResultTabs.tsx`, `DiffTable.tsx` (highlight cam, phân trang 50), `TableSearchFilter.tsx`, `ExportButton.tsx`.
- [x] Task 4.4: `src/app/page.tsx`, `Header.tsx`, `Footer.tsx`, `StepHeading.tsx`, `InlineAlert.tsx`.
- [x] *Checkpoint 4*: `npm run build` → **exit 0**; browser E2E với 2 tệp mẫu — PASS.

### Phase 5: Audit, Security & Launch — HOÀN TẤT PHẦN LOCAL (xác minh lại 2026-10-28 21:17)
- [x] Task 5.1: Zero-Server audit — 0 API route, 0 fetch/XHR; browser 16 static GET, 0 POST/PUT.
- [x] Task 5.2: Benchmark 10.000 dòng → **90ms** (< 2000ms); browser 24 dòng → 7ms; bảng phân trang 50 dòng.
- [x] Task 5.3: CI `.github/workflows/ci.yml` — push mọi nhánh + PR, Node 22, lint → typecheck → test → build.
- [x] Task 5.4: Cleanup + linter — 0 error/0 warning, không TODO/FIXME/console.log trong `src/`.
- [ ] Task 5.5: Deploy thực tế lên Vercel — **cần quyền truy cập tài khoản/Vercel của chủ dự án**.
- [x] *Checkpoint 5*: Nghiệm thu AC-01 → AC-05 bằng test + browser; AC-06 bằng network audit.

### FINAL REVIEW — ACCEPTANCE CRITERIA (2026-10-28 21:22) — TẤT CẢ ĐẠT
- [x] AC-01: Parse `.xlsx` + `.csv` mẫu trong **37.6ms** (< 2s), danh sách cột đúng; UI hiển thị đủ dòng/cột.
- [x] AC-02: `" ORD-001 "` → `ord-001`; mẫu `" ORD-101 "` ↔ `"ord-101"` ghép cặp chính xác.
- [x] AC-03: `1,000,000` vs `900,000` → tab "Lệch giá trị", `Δ = -100000` chính xác bằng Big.js.
- [x] AC-04: Tách đúng `onlyInA = [ord-107, ord-111]`, `onlyInB = [ord-113, ord-114]`.
- [x] AC-05: Xuất **1 Tổng quan + 4 sheet kết quả**; dòng lệch cam `FFFFF2CC`, Δ đỏ `FFC00000`; validate bằng ExcelJS + openpyxl.
- [x] AC-06: Zero-Server — 16 static GET, 0 xhr/fetch, 0 POST/PUT, 0 API route.
- [x] Lighthouse desktop: Accessibility 100 · Best Practices 100 · SEO 100 · Agentic Browsing 100.
- [x] **Trạng thái phát hành: `RELEASED READY 1.0`** (deploy Vercel chờ quyền tài khoản).

---

## 4. QUYẾT ĐỊNH KỸ THUẬT & GHI CHÚ CHUYỂN GIAO (TECHNICAL DECISIONS)

1. **Pure Engine Isolation**: `src/lib/engine/` chỉ import `big.js`, `papaparse`, types nội bộ; không React/Next/DOM. Đã kiểm tra bằng script audit import.
2. **SSR Safety**: `exceljs` và `file-saver` chỉ được `await import()` trong event handler (exporter/hook), không import top-level ở client page.
3. **Big.js**: Mọi phép trừ tiền tệ dùng Big.js; `delta` lưu dạng **string thập phân** trong `DiffRecord` để giữ độ chính xác và serializable.
4. **Next.js 16.4.3**: Đã đọc `node_modules/next/dist/docs/` (`use-client`, `single-page-applications`, `cache-components`, `vitest`). `cacheComponents` + `partialPrefetching` giữ nguyên; trang `/` là static client shell.
5. **shadcn/ui base-nova**: Project dùng **Base UI** (`@base-ui/react`) thay vì Radix. Các wrapper `Select`, `Tabs`, `Button` giữ đúng API hiện có; không nâng/hạ version.
6. **Report format**: 5 worksheet = 1 `Tổng quan` + 4 `kết quả`; diễn giải "4 sheet kết quả" trong AC-05/PRD.
7. **Legacy `.xls`**: không hỗ trợ đọc BIFF; đã có mã lỗi `LEGACY_XLS_UNSUPPORTED` và hướng dẫn chuyển `.xlsx`. Cần bổ sung thư viện nếu muốn hỗ trợ thật (ngoài danh sách phê duyệt hiện tại).
8. **Zero-Server**: Không tạo `route.ts`, Server Action, `fetch`, `localStorage` chứa dữ liệu tệp. Logger production không in giá trị tài chính.
9. **Kết quả phân loại**: `ReconcileResult` (engine) + `elapsedMs`/`runId` (hook). `useReconciler` quản lý `activeTab`/`search` và trả `activeTabRecords`/`filteredRecords` bằng `useMemo`; `ResultTabs` chỉ hiển thị dữ liệu đã lọc.
10. **An toàn xuất Excel**: ô text bắt đầu bằng `=`, `+`, `-`, `@` (không phải số) được prefix `'` để chặn formula injection.
11. **Release acceptance tests**: `tests/release-acceptance.test.ts` chạy trực tiếp trên dữ liệu mẫu trong `public/sample-data` để nghiệm thu AC-01 → AC-05, tránh test chỉ dựa trên mock.
12. **Runtime pin**: `package.json` khai báo `engines.node >= 22` khớp với CI (`actions/setup-node@v4`, Node 22) và yêu cầu của package `cn`.

---

## 5. VIỆC CẦN LÀM TIẾP THEO (HANDOFF / NEXT TASK)

**Trạng thái chuyển giao**: Final Review đã hoàn tất — toàn bộ **AC-01 → AC-06 đạt**, 6 files / 59 tests pass, lint/typecheck/build exit 0, Lighthouse 100. Dự án ở trạng thái **RELEASED READY 1.0**.

**Task tiếp theo được đề xuất**: `Task 5.5 — Deploy Vercel` (cần chủ dự án cấp quyền/tài khoản) → mở **Deferred Features (roadmap Phase 2+)** theo đúng thứ tự ưu tiên:

1. `Composite Key`: ghép nhiều cột khóa (ví dụ `Ngày` + `Mã đơn`).
2. `Fuzzy String Matching`: Levenshtein/Dice cho tên đối tác.
3. `Quan hệ 1-N`: một mã thanh toán nhiều đợt.
4. `Saved Templates`: lưu mapping vào `localStorage` (không lưu dữ liệu tài chính).
5. `Web Worker / DuckDB-WASM` cho tệp > 200.000 dòng.

**Lệnh xác nhận trước khi bàn giao**:
```bash
npx tsc --noEmit && npm run lint && npx vitest run && npm run build
```

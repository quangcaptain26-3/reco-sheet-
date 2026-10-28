# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three Vietnamese office roles, all working at a desktop or laptop under period-close time pressure, all handling files they are not permitted to upload to a third-party server:

- **Kế toán thanh toán / đối soát công nợ (primary).** End-of-day or month-end reconciliation of a bank statement or supplier invoice list against an internal cash book (sổ quỹ). Stray spaces, mixed case, and inconsistent separators make their keys fail in `VLOOKUP`/`XLOOKUP` with `#N/A`, so they fall back to eye-matching rows.
- **Chuyên viên vận hành sàn TMĐT / bán hàng.** Reconciles an order export against courier payout reports (GHN, Viettel Post, Shopee, TikTok Shop) to find orders docked wrongly for shipping, promotion, or platform fee — an error that totals alone hide.
- **Điều vận / chứng từ logistics & XNK.** Matches container numbers, seal numbers, and storage/demurrage charges between a carrier or port statement and an internal tracking sheet, where each party names and spaces identifiers differently.

The product is public self-serve: no account, no workspace, no administrator, no onboarding call. A user arrives with two files and expects to be done in minutes.

## Product Purpose

RecoSheet reconciles two spreadsheets in the browser. The user drops file A (the reference source, e.g. an internal ledger) and file B (the comparison source, e.g. a bank statement), picks a key column and an optional value column on each side, and gets every row classified as matched, value discrepancy (with Δ = B − A), only in A, or only in B — plus a formatted, colored Excel report.

Success means a user who would have spent an afternoon on lookups and manual scanning gets a defensible answer in seconds and can hand the report to a manager or partner without rework.

## Positioning

The defensible position is the combination, not any single feature:

- **The file never leaves the tab.** No upload endpoint, no server storage, no telemetry on file contents. This is what makes the tool admissible for finance data at all.
- **Dirty data is the input, not a precondition.** The tool repairs the identifiers and Vietnamese money formats that break lookups (`" ORD-001 "`, `1.250,50 đ`, `(1.500.000)`, `15.000-`) instead of demanding clean files first.
- **Money arithmetic is exact.** Δ is computed with Big.js and stored as a decimal string, so a difference is defensible to the đồng.
- **The output is a finished deliverable.** A styled five-sheet workbook with Vietnamese sheet names that opens in Excel and Google Sheets, not a raw diff.

The zero-server guarantee is the lead claim and the one future work must never weaken. The other three are why the privacy is useful rather than merely reassuring.

## Operating Context

- A statement arrives as `.csv` or `.xlsx`; the internal side is exported from accounting or an order system. Files are often passed around by chat or email and reconciled on a company laptop.
- Recurring documents: bank statements (sao kê), cash books (sổ quỹ), supplier invoices, ecommerce order exports, courier payout reports, container/seal lists.
- The report's audience is a manager, another accountant, or an external partner who opens the `.xlsx` in Microsoft Excel desktop or Google Sheets. The default filename `Bao-cao-doi-soat-YYYY-MM-DD.xlsx` and the sheet names `Tổng quan`, `Lệch giá trị`, `Chỉ có ở A`, `Chỉ có ở B`, `Khớp hoàn toàn` are part of that handoff.
- Teams often accept small differences (rounding, fees) through an absolute tolerance before a row counts as a discrepancy.
- Duplicate keys are real — one order can be paid in installments. Users must be warned, but the run must not be blocked.

## Capabilities and Constraints

Shipped capability:

- Reads `.xlsx` (first worksheet, ExcelJS) and `.csv` (PapaParse, BOM/UTF-16, auto delimiter) from a browser `File`; shows a five-row preview, row/column counts, and the sheet name.
- Cleaning rules: trim plus whitespace collapse plus zero-width/NBSP removal, case-insensitive matching, optional removal of `- . _ /`.
- Flexible money parsing: thousands separators, currency suffixes, accounting negatives in parentheses, trailing minus.
- One-to-one hash-map matching in O(N+M); duplicate keys paired in appearance order; blank keys skipped.
- Δ = B − A as an exact decimal string, with a configurable non-negative tolerance.
- One key column and one optional value column per file; the value column must be set on both sides or on neither.
- Four result groups, searchable and paginated at 50 rows per page, with amber highlighting on discrepancies.
- Export of one `Tổng quan` sheet plus four result sheets, with styled headers, orange discrepancy rows, red Δ cells, freeze panes, auto filters, and a formula-injection guard.

Constraints that bound any future work:

- **Client-only.** No route handler, Server Action, `fetch`, or telemetry carrying file data; no `localStorage` of file contents. `exceljs` and `file-saver` are dynamically imported inside event handlers; `src/lib/engine/` stays pure TypeScript with no React or Next imports.
- 10 MB per file, designed for fewer than 30,000 rows; 10,000 rows must reconcile well inside two seconds.
- Only the first worksheet of an Excel workbook is read. `.xls` (BIFF) is unsupported and is detected with an explicit `LEGACY_XLS_UNSUPPORTED` message rather than a crash.
- Desktop-first from 1280px up, on current Chrome, Edge, Safari, and Firefox. Not a mobile-first product.
- The stack is fixed by the incumbent codebase: Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui on Base UI, Lucide icons, Vitest. New dependencies need the owner's approval.
- Explicitly deferred and not part of the product yet: composite keys, fuzzy matching, one-to-many relations, saved mapping templates, and Web Worker or DuckDB-WASM handling for files beyond 200,000 rows.

## Brand Commitments

- **Name:** RecoSheet. `reconciler-app` is the repository name; "Smart Sheet Reconciler" is a descriptor used in planning docs, not the product name.
- **Language:** Vietnamese only for v1 — interface copy, errors, empty states, helper text, and exported sheet names. No internationalization requirement exists yet.
- **Voice:** plain, literal, colleague-to-colleague Vietnamese. It states the privacy guarantee as a fact rather than selling it; no hype, no emoji, no English jargon where a Vietnamese term exists.
- **Privacy is a visible promise on the surface** (hero, dropzone, footer), never a footnote or a modal.

## Evidence on Hand

- `public/sample-data/sample_internal_ledger.xlsx` and `public/sample-data/sample_bank_statement.csv`, regenerable with `npm run samples`. Expected outcome with `Mã đơn ↔ Mã giao dịch`, `Số tiền ↔ Số tiền`, tolerance 0: 8 matched, 2 value discrepancies, 2 only in A, 2 only in B, total Δ = −95.000.
- `tests/fixtures/sample_A.json` and `sample_B.json`, plus a Vitest suite covering the engine, parser errors, exporter formatting, and end-to-end acceptance against the sample files.
- Measured results recorded in `UPDATE.md`: 10,000-row reconciliation around 90 ms; production build static at `/`; zero `fetch`/XHR in the browser audit.
- Real product documentation in `docs/` (PRD, blueprint, architecture, tech stack) and a living status journal in `UPDATE.md`.

Absences that future work must not paper over: there are no real customer names, logos, testimonials, case studies, usage metrics, press mentions, pricing, or security certifications. There is no brand mark beyond `src/app/favicon.ico`. No claim of adoption, revenue, or third-party audit is supported.

## Product Principles

1. **The file never leaves the browser.** A feature that needs uploads, server compute, or content telemetry is out of scope, not a trade-off to weigh.
2. **Repair before comparing, and be honest about the repair.** Cleaning is a visible, toggleable rule set — never silent magic that changes what the user believes they compared.
3. **Numbers must survive scrutiny.** Exact decimal arithmetic, an explicit Δ direction, and a stated tolerance, so a result can be defended line by line.
4. **Deliver a document, not a screen.** The Excel report is what leaves the tool and gets forwarded, so it carries the same care as the interface.
5. **No account, no setup, no learning curve.** The first screen is the task; if a step does not help reconcile two files, it does not belong.

## Accessibility & Inclusion

- Keyboard-operable throughout: native inputs, labelled selects, switch roles, focus handling and Escape in the preview modal, visible focus, and `aria-live` announcements for results and errors.
- Vietnamese diacritics and local number and currency formats are first-class, never a locale afterthought.
- Desktop-first is a genuine constraint — the work happens on office laptops — so the layout must stay usable on a small laptop viewport rather than assuming a wide monitor.

---
name: RecoSheet
description: "A neutral reconciliation desk: paper-white surfaces, one verification green, hairline rings, numbers that line up."
colors:
  paper: "oklch(1 0 0)"
  paper-dim: "oklch(0.97 0 0)"
  paper-soft: "oklch(0.985 0 0)"
  ink: "oklch(0.145 0 0)"
  ink-strong: "oklch(0.205 0 0)"
  graphite: "oklch(0.556 0 0)"
  hairline: "oklch(0.922 0 0)"
  focus-ring: "oklch(0.708 0 0)"
  verify: "oklch(0.596 0.145 163.225)"
  verify-strong: "oklch(0.508 0.118 165.612)"
  verify-deep: "oklch(0.432 0.095 166.913)"
  verify-wash: "oklch(0.979 0.021 166.113)"
  verify-line: "oklch(0.905 0.093 164.15)"
  compare: "oklch(0.5 0.134 242.749)"
  compare-wash: "oklch(0.977 0.013 236.62)"
  compare-line: "oklch(0.901 0.058 230.902)"
  caution: "oklch(0.555 0.163 48.998)"
  caution-wash: "oklch(0.987 0.022 95.277)"
  caution-line: "oklch(0.924 0.12 95.746)"
  alarm: "oklch(0.514 0.222 16.935)"
  alarm-wash: "oklch(0.969 0.015 12.422)"
  alarm-line: "oklch(0.892 0.058 10.001)"
  scrim: "oklch(0.129 0.042 264.695)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  support:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.025em"
  metric:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    fontFeature: "tabular-nums"
  code:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  pill: "26px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "10": "40px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink-strong}"
    textColor: "{colors.paper-soft}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "oklch(0.205 0 0 / 0.8)"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-export:
    backgroundColor: "{colors.verify-strong}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 10px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "4px 10px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge-pill:
    backgroundColor: "{colors.paper-dim}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "0 8px"
  tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "28px"
---

# Design System: RecoSheet

## Overview

**Creative North Star: "The Reconciliation Desk"**

A tidy accountant's desk an hour before close: paper-white surfaces squared to the edge of the table, a faint ruled grid underneath, and one green stamp that only lands on something already verified. Nothing on the desk is there to look impressive. It is there because the work needs it.

The surface behaves like an instrument, not a landing page. Structure is drawn with hairlines and tonal paper, not with shadow or colour; colour is a label on an outcome, never an atmosphere. The one moment of expressive restraint is the hero: a 32px grid behind the top of the page that fades out before the first card, the visual equivalent of graph paper under a clean form.

Density is that of a working document rather than a marketing site: 14px body, 11px metadata, 32px controls, 20px rhythm. Vietnamese copy gets room to breathe because Vietnamese is longer and taller than English at the same point size. Motion is limited to state change — a colour shift, a 100ms popover, a spinner — because the thing that should feel fast is the reconciliation, not the interface.

**Key Characteristics:**
- Paper-white and grayscale structure; exactly one green that means "verified".
- Depth from hairline rings and low-alpha tonal washes, not from cast shadows.
- A fixed four-signal vocabulary: green = matched/safe, amber = value discrepancy, rose = only in A, sky = only in B.
- Numerals are the content: right-aligned, tabular, signed, never abbreviated into vagueness.
- The page is a numbered, three-step work order — files, rules, results — never a dashboard of unrelated widgets.
- Vietnamese-first typography and copy; no English chrome, no emoji, no decorative illustration.

## Colors

A neutral instrument with one brand-carrying green and three status hues that never change job.

### Primary
- **Verification Green** (`verify`): the trust colour. It appears on the privacy promise (hero shield line, header lock pill, footer), on completed step markers, on "khớp hoàn toàn" results, on enabled cleaning switches, and on the one export call to action. Its scarcity is what makes it read as a stamp rather than a theme.
- **Verification Green, Deep** (`verify-strong`): the export button fill — the only saturated surface larger than a badge.
- **Verification Green, Ink** (`verify-deep`): text on green washes — header pill label, "đã tải đủ 2 tệp" badge.
- **Verification Green, Wash / Line** (`verify-wash`, `verify-line`): the 50-level field and 200-level hairline behind the privacy notice, success alerts, and matched KPI.

### Secondary
- **Comparison Blue** (`compare`): permanently bound to file B, the comparison source. It tints the B dropzone accent, the "chỉ có ở B" badge and rows, and the B KPI. It is never used for emphasis, links, or primary action.
- **Comparison Blue, Wash / Line** (`compare-wash`, `compare-line`): the paired background and hairline for the same surfaces.

### Tertiary
- **Caution Amber** (`caution`): value discrepancy. Amber rows, amber Δ badges, amber KPI, warning alerts, and the Δ formula footnote. It marks "look here", not "broken".
- **Caution Amber, Wash / Line** (`caution-wash`, `caution-line`): discrepancy row tint at 45% alpha and the hairline that keeps it legible on white.
- **Alarm Rose** (`alarm`): rows and codes present in A but absent in B, plus destructive/error states. Rose is a data-loss signal; it is never used for emphasis or required-field decoration beyond the single required asterisk.
- **Alarm Rose, Wash / Line** (`alarm-wash`, `alarm-line`): the paired tint and hairline.

### Neutral
- **Paper** (`paper`): page and card field. The whole surface begins here.
- **Paper, Dim** (`paper-dim`): segmented-control track, toggle off-state, tab counts, muted chips.
- **Paper, Soft** (`paper-soft`): text on near-black fills; also the lightest neutral step.
- **Ink** (`ink`): body and heading text, table headers, the header brand square, and the active step marker — the system's "black".
- **Ink, Strong** (`ink-strong`): the primary button fill only, one step softer than ink so a row of black buttons never competes with the heading above it.
- **Graphite** (`graphite`): all secondary text: hints, metadata, labels, table row numbers.
- **Hairline** (`hairline`): every 1px rule, card ring, input border, divider.
- **Focus Ring** (`focus-ring`): keyboard focus ring at 50% alpha, 3px.
- **Scrim** (`scrim`): the modal backdrop at 45% alpha with a 2px blur.

### Named Rules
**The One Stamp Rule.** Green is evidence, not decoration. It may cover no more than roughly a tenth of any viewport, and only where the product is asserting safety, completion, or the export handoff. A green panel that is not one of those three things is a bug.

**The Two Files Rule.** Green belongs to A (nguồn đối chiếu), blue belongs to B (nguồn so sánh). The pairing is semantic, not aesthetic — never swap it, never reuse blue for a third concept, and never let a status hue appear without its matching label.

**The Wash Rule.** Status colour arrives as a low-alpha wash plus a 200-level hairline plus 700-level text. Saturated fills are reserved for badges and the export button; a full-width saturated band is out of bounds.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui)
**Body Font:** Geist (same stack, same voice)
**Label/Mono Font:** Geist Mono, declared for identifiers and technical strings; the shipped UI currently renders numbers with tabular Geist rather than monospace.

**Character:** One grotesque, no display face, no serif. Hierarchy is carried entirely by size, weight, and tight tracking, which keeps the page feeling like a well-set internal form rather than a brand campaign. Vietnamese diacritics are the test case: line heights are generous (1.5–1.625 on body) so stacked marks never collide.

### Hierarchy
- **Display** (600, 2.6rem at `sm` and up, 1.12): the single hero sentence, left-aligned, with one emerald fragment inside it. Tracking is tight; the line is balanced so it never orphans a word.
- **Headline** (600, 1.875rem on narrow viewports, 1.2): the hero before `sm`, and any future page title.
- **Title** (600, 1rem, 1.5): step headings and result-panel titles; the workhorse heading. Card titles tighten to 1.375 and drop to weight 500.
- **Body** (400, 0.875rem, 1.625): descriptions, hints in prose, table cells. Hero supporting copy steps up to 15px and is capped at 672px wide so it breaks after roughly two sentences.
- **Support** (400, 0.8125rem, 1.5): step descriptions, field groups, and secondary explanations that need to sit above the 11px Label step without competing with body copy.
- **Label** (500, 0.6875rem, 0.025em, often uppercase): metadata, field hints, KPI captions, footer, safety footnotes. This is the smallest recurring size.
- **Metric** (600, 1.5rem, tabular): the four KPI numbers, right-sized to be scanned, not shouted.
- **Code** (400, 0.75rem): reserved for raw identifiers when they need to be distinguished from cleaned ones.

### Named Rules
**The 11px Floor.** Operational text never goes below 11px; 10px is permitted only for a secondary annotation nested inside a row that already has an 11px line (counts in tabs, "Gốc:" hints). Anything smaller is unreadable on the office laptops this product targets.

**The Right-Aligned Number Rule.** Every amount, delta, row number, and count is right-aligned and tabular. A column of money that does not line up on the decimal is a defect, regardless of how it looks.

**The Three-Weight Rule.** Only 400, 500, and 600 exist. No 700 headlines, no 300 light text; weight is a hierarchy tool, not a mood.

## Layout

A single task column, `max-w-6xl` (1152px) wide, centred with 16px gutters, under a 56px sticky header. The header is translucent paper with a hairline bottom edge and a 12px backdrop blur; it is the only fixed element on the page.

The page reads top to bottom as a work order: hero and privacy promise, then step 1 (two dropzones), step 2 (mapping rules), step 3 (results). Steps sit as full-width cards separated by 20px, each with a bordered header strip, a padded body, and an optional tinted footer strip. Inside a card, the rhythm is 20px padding and 16px gaps; nested sub-panels use 16px padding on a `paper-dim`-at-low-alpha wash.

Two-column splits exist only to pair like with like: the A/B dropzones split at `lg`, the A/B mapping panels split at `md`, the KPI row runs 2-up then 4-up at `xl`. Everything else is one column. The results table lives in a 540px-tall scroll viewport with a sticky header and 50 rows per page, keeping the page height predictable when a result set has thousands of rows.

The 32px grid is a hero-only device: it spans the top 420px of the main area at 60% opacity and is masked to transparent before the first card. It never reappears behind data.

Desktop-first is literal: the design target is a 1280px office laptop, and narrow viewports simply collapse the paired columns rather than gaining a different interface. There is no mobile navigation, drawer, or compact mode to design against.

**The Single Column Rule.** New sections are added as another step in the vertical work order. A sidebar, a dashboard grid of unrelated modules, or a two-column marketing layout would break the mental model of "one desk, one task".

## Elevation & Depth

The system is flat by default. Structural depth is drawn with a 1px ring — a hairline border or an inset ring at 10–70% of the neutral line — plus a tonal wash one step off paper. A real shadow appears only as a whisper: `shadow-sm` under cards, dropzones, the switch knob, and the header logo; `shadow-md` on the select popover; `shadow-2xl` on the preview modal, which is the only object allowed to float above the page. There is no hover lift, no parallax, no glassmorphism beyond the header's blur.

### Shadow Vocabulary
- **Card whisper** (`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): cards and dropzones at rest; its job is to keep white-on-white edges from dissolving, not to imply height.
- **Popover lift** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): select menus only.
- **Modal float** (`0 25px 50px -12px rgb(0 0 0 / 0.25)`): the preview dialog, paired with the scrim.

### Named Rules
**The Ring, Don't Cast Rule.** When a surface needs separating from its neighbour, add a hairline ring or a tonal wash first. Reach for a shadow only if the surface genuinely floats (popover, modal) or if it is the single quiet card lift described above.

**The Single Scrim Rule.** Exactly one overlay treatment exists: the modal backdrop. No dimmed hero images, no translucent panels over content, no stacked scrims.

## Shapes

Corners step by scale, never by taste: controls and inputs at `lg` (10px), cards and dialogs at `xl` (14px), small inner chips and menu items at `md` (8px), badges and switches fully pill (`pill` for the 20px badge, `full` for the 36×20px switch track and the 32px step circles). Nothing uses an asymmetric corner, and nothing mixes two radii on one object.

Borders are hairlines. A dashed border means "empty, waiting for input" and appears only on the dropzone's upload target. Solid hairlines mean structure. There are no thick borders, no double borders, no outlined-on-outlined stacking — nested panels drop to a wash instead of adding another visible box.

Silhouette is otherwise rectangular and calm. The only circular forms are the step markers, the switch knob, and the upload icon well, which is what gives those three elements their "stamp" quality.

## Components

### Buttons
- **Shape:** `lg` radius (10px), 32px default height, 28px small, 36px large, icon-only 24/28/32/36px squares.
- **Primary:** the near-black ink fill with soft paper text, 14px medium label, 10px horizontal padding, 6px icon gap. This is the default action — "Bắt đầu đối soát" is black, not green.
- **Hover / Focus:** fill drops to 80% alpha on hover; focus swaps the border to the ring colour and adds a 3px translucent ring at 50%; active state nudges down 1px. Transitions cover all properties at the default 150ms.
- **Outline:** paper fill, hairline border, hover to the dim paper wash; used for secondary actions ("Đối soát lại", pagination).
- **Ghost:** transparent until hover, then the dim wash; used inside file cards and for destructive "Xoá tất cả", which stays graphite rather than red until the moment of action.
- **Export:** the one green button — a 36px-tall `verify-strong` fill with white text and a whisper shadow, always accompanied by a download icon.
- **Disabled:** 50% opacity, pointer events off. Never a greyed-out green; the fill stays its own colour and fades.

### Inputs / Fields
- **Style:** 32px tall, paper fill, hairline border, 10px radius, 14px text. Numeric fields are right-aligned and tabular; search fields carry a leading 14px icon and a trailing clear button.
- **Focus:** border shifts to the focus colour plus a 3px translucent ring — the same ring for buttons, inputs, selects, tabs, and switches, so keyboard focus looks identical everywhere.
- **Error:** border and ring shift to the alarm hue at reduced alpha, paired with an 11px message below. Errors never replace the hint; they overwrite it in place so the field does not jump.
- **Select:** mirrors the input shell with a trailing chevron; the popup is paper with a hairline ring, `md` corners, 100ms fade-and-zoom, and a check mark on the active option.

### Cards / Containers
- **Corner Style:** `xl` (14px); nested file cards also use `xl`, mapping sub-panels use `lg`.
- **Background:** paper for step cards; `paper-dim` at 15–30% alpha for grouping washes and footer strips.
- **Shadow Strategy:** one whisper shadow plus a 1px ring — see Elevation & Depth.
- **Border:** the ring replaces the border on page-level cards (`border-0` plus `ring-1`), so the card edge never doubles up.
- **Internal Padding:** 20px on page cards, 16px on nested panels; 16px gaps in grids, 12–20px between stacked fields.

### Step Heading (signature)
A 32px circular marker, a 16px semibold title, and a 13px graphite description. The marker carries state: ink fill and paper numeral when active, `verify` fill and white numeral when done, dim wash and graphite numeral when idle. The step number is decorative (`aria-hidden`) because the heading text already describes the step.

### Dropzone (signature)
A 172px-tall dashed target inside a card, with a 44px circular icon well tinted by file role, a 14px instruction line, an 11px format-and-size line, and a 10px green lock line reading "Không upload lên máy chủ". Hover shifts only the dashed border to the role accent. Dragging covers the whole card with an 85% paper overlay, a role-coloured dashed edge, and the instruction "Thả tệp để tải lên / thay thế". Once a file is read, the target is replaced by a file card with name, size, sheet name, row and column counts, and preview/replace/remove actions.

### KPI Cards
Four equal cards, each with a tone-specific top wash fading to paper, a matching 200-level ring, an 11px uppercase caption, a 24px tabular value in the tone's 700-level text, and a 32px tonal icon tile. Below them, a single strip of 11px metadata carries row totals, elapsed time, and the skipped-row warning. The gradient is vertical and subtle; it must never read as a coloured card.

### Tabs
A segmented control on the dim wash with 8px corners: four equal-width triggers at `sm` and up, a 2×2 grid below it. The active trigger is paper with a whisper shadow and full ink text; inactive triggers sit at 60% of ink. Each label carries a pill-shaped count, so the tab row doubles as the result summary.

### Status Badges and Alerts
Status badges are 20px pills with a tinted wash, a matching 200-level ring, 12px medium text, and no border. Δ badges are special: zero is green, positive is amber, negative is rose, and an unparsable value reads "Không so sánh được" in amber rather than pretending to be zero. Alerts are 14px rounded-`lg` panels with a 16px leading icon and a 10px gap; body copy is 13px, and there are four fixed variants: rose error, amber warning, sky info, green success. Errors and warnings announce as `alert`, info and success as `status`.

### Data Table
A hairline-framed 540px scroll region with a sticky header on a 90% dim wash and a backdrop blur. Header cells are 14px medium ink; body cells run 12–14px on 8px padding, and the preview modal steps its headers down to 11px uppercase. Row tint encodes status (amber discrepancy, rose only-A, sky only-B), applied at 35–45% alpha so text and the badge stay legible. Money, deltas, and row numbers are right-aligned and tabular; long keys truncate with a tooltip and print the raw pre-cleaning value underneath in 10px graphite.

### Exported Workbook (non-web surface)
The `.xlsx` is a separate, deliberately louder surface because it is read at a distance and printed: a navy header row with white bold text, pale tinted rows per status, red bold Δ cells, frozen header, auto filter, and a zebra wash. Its palette is not the web palette and must not be back-ported into the UI; the shared rule is only that each status keeps the same meaning (amber = discrepancy, green = matched).

## Do's and Don'ts

### Do:
- **Do** let the page stay grayscale until an outcome exists; colour enters with a result, a status, or the privacy promise.
- **Do** draw new separations with a hairline ring or a dim wash before reaching for a shadow.
- **Do** keep the four status meanings locked: green matched, amber discrepancy, rose only-in-A, sky only-in-B.
- **Do** right-align and tabular-align every numeral, and print Δ with an explicit sign.
- **Do** keep operational text at 11px or larger, with 1.5–1.625 line height for Vietnamese.
- **Do** describe the privacy guarantee as a plain fact in the same voice as the rest of the UI — a shield icon, one sentence, no badge shouting.
- **Do** keep forms in the vertical work order and pair A/B side by side only at `md`/`lg` and above.

### Don't:
- **Don't** use green as a general accent, gradient source, or decorative background; it means "verified" and nothing else.
- **Don't** introduce a second typeface, a serif display face, or a weight outside 400/500/600.
- **Don't** add hover lift, scale-on-hover, drop shadows on buttons, or animated entrances for page sections.
- **Don't** ship marketing furniture on the tool surface: testimonial blocks, pricing cards, logo walls, feature grids, or hero illustrations.
- **Don't** colour a whole panel saturated, stack a border on a ring, or mix two corner radii on one object.
- **Don't** build a dark theme opportunistically: a `.dark` token block exists in `globals.css` but nothing toggles it, and the shipped surface is light only.
- **Don't** translate or restyle the interface into English; copy, sheet names, and error text are Vietnamese only.

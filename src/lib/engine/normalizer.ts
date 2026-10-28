/**
 * Pure normalisation helpers for identifiers and monetary values.
 *
 * Rules:
 *  - no React / DOM / Next.js imports (engine isolation);
 *  - deterministic output, safe on both Node and the browser;
 *  - monetary parsing is exact thanks to big.js.
 */

import Big from "big.js";

export interface NormalizeKeyOptions {
  /** Collapse repeated whitespace and trim both ends (default: true). */
  autoTrim?: boolean;
  /** Compare identifiers case-insensitively (default: true). */
  caseInsensitive?: boolean;
  /** Remove separators such as `-`, `.`, `_`, `/` (default: false). */
  stripPunctuation?: boolean;
}

const ZERO_WIDTH = /[\u200b-\u200d\ufeff]/g;
const NON_BREAKING_SPACES = /[\u00a0\u2007\u202f]/g;
const SEPARATORS = /[-._/\\]/g;

/**
 * Normalise an identifier for matching.
 *
 * Examples (autoTrim + caseInsensitive):
 *   " ORD-101 " -> "ord-101"
 *   "ord-101"   -> "ord-101"
 */
export function normalizeKey(
  value: unknown,
  options: NormalizeKeyOptions = {}
): string {
  const {
    autoTrim = true,
    caseInsensitive = true,
    stripPunctuation = false,
  } = options;

  if (value === null || value === undefined) {
    return "";
  }

  let text = typeof value === "string" ? value : String(value);

  text = text.normalize("NFC").replace(ZERO_WIDTH, "").replace(NON_BREAKING_SPACES, " ");

  if (autoTrim) {
    text = text.replace(/\s+/g, " ").trim();
  }

  if (stripPunctuation) {
    text = text.replace(SEPARATORS, "");
  }

  if (caseInsensitive) {
    text = text.toLowerCase();
  }

  return text;
}

/**
 * Detect whether a single separator is a decimal mark.
 *
 * Heuristics geared towards accounting data:
 *   "1,000"    -> thousands (1000)
 *   "12.345"   -> thousands (12345)
 *   "1.250,50" -> comma decimal (handled before this helper)
 *   "1000.500" -> decimal (1000.5)
 *   "0.500"    -> decimal (0.5)
 */
function isDecimalSeparator(raw: string, separator: "." | ","): boolean {
  const lastIndex = raw.lastIndexOf(separator);
  if (lastIndex < 0) {
    return false;
  }

  const occurrences = raw.split(separator).length - 1;
  if (occurrences > 1) {
    return false;
  }

  const before = raw.slice(0, lastIndex).replace(/[.,]/g, "");
  const after = raw.slice(lastIndex + 1);

  if (
    after.length === 3 &&
    before.length > 0 &&
    before !== "0" &&
    before.length <= 3
  ) {
    return false;
  }

  return true;
}

function numericTextOf(raw: string): string | null {
  if (!/\d/.test(raw)) {
    return null;
  }

  const lastDot = raw.lastIndexOf(".");
  const lastComma = raw.lastIndexOf(",");

  let decimalSeparator: "." | "," | null = null;

  if (lastDot >= 0 && lastComma >= 0) {
    decimalSeparator = lastDot > lastComma ? "." : ",";
  } else if (lastDot >= 0) {
    decimalSeparator = isDecimalSeparator(raw, ".") ? "." : null;
  } else if (lastComma >= 0) {
    decimalSeparator = isDecimalSeparator(raw, ",") ? "," : null;
  }

  let integerPart: string;
  let fractionPart = "";

  if (decimalSeparator) {
    const index = raw.lastIndexOf(decimalSeparator);
    integerPart = raw.slice(0, index);
    fractionPart = raw.slice(index + 1);

    if (/[.,]/.test(fractionPart)) {
      return null;
    }
  } else {
    integerPart = raw;
  }

  integerPart = integerPart.replace(/[.,]/g, "");

  if (!/^\d+$/.test(integerPart) || (fractionPart && !/^\d+$/.test(fractionPart))) {
    return null;
  }

  integerPart = integerPart.replace(/^0+(?=\d)/, "");

  return fractionPart ? `${integerPart}.${fractionPart}` : integerPart;
}

/**
 * Parse a cell into an exact decimal value.
 * Returns `null` when the cell does not contain a usable number.
 *
 * Handles: "1,000,000", "1.000.000", "1.250,50 đ", "(1,500,000)",
 * "-15.000", numbers, bigints, currency symbols and stray letters.
 */
export function parseAmountToBig(value: unknown): Big | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? new Big(value.toString()) : null;
  }

  if (typeof value === "bigint") {
    return new Big(value.toString());
  }

  if (typeof value === "boolean") {
    return null;
  }

  let text = String(value)
    .normalize("NFC")
    .replace(NON_BREAKING_SPACES, " ")
    .trim();

  if (!text) {
    return null;
  }

  let negative = false;

  const parenthesised = text.match(/^\((.*)\)$/);
  if (parenthesised) {
    negative = true;
    text = parenthesised[1];
  }

  // Drop currency names/symbols and every other character except digits and
  // numeric separators. `e`/`E` is intentionally excluded: scientific notation
  // coming from a text cell is ambiguous and rejected.
  text = text.replace(/[^\d.,-]/g, "");

  if (!text || !/\d/.test(text)) {
    return null;
  }

  if (text.startsWith("-")) {
    negative = !negative;
    text = text.slice(1);
  }

  if (text.endsWith("-")) {
    negative = !negative;
    text = text.slice(0, -1);
  }

  text = text.replace(/-/g, "");

  const numericText = numericTextOf(text);
  if (numericText === null) {
    return null;
  }

  try {
    return new Big(`${negative ? "-" : ""}${numericText}`);
  } catch {
    return null;
  }
}

/** Convenience wrapper returning a JavaScript number (display purposes). */
export function parseAmount(value: unknown): number | null {
  const exact = parseAmountToBig(value);
  return exact ? exact.toNumber() : null;
}

/** Exact absolute tolerance comparison used by the matcher. */
export function isWithinTolerance(
  delta: Big,
  tolerance: number | string
): boolean {
  const threshold = new Big(String(Math.abs(Number(tolerance) || 0)));
  return delta.abs().lte(threshold);
}

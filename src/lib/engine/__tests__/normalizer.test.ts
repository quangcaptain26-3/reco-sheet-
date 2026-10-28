import { describe, expect, it } from "vitest";
import {
  isWithinTolerance,
  normalizeKey,
  parseAmount,
  parseAmountToBig,
} from "../normalizer";
import Big from "big.js";

describe("normalizeKey", () => {
  it("trims and lowercases identifiers (AC-02)", () => {
    expect(normalizeKey(" ORD-101 ", { autoTrim: true, caseInsensitive: true })).toBe(
      "ord-101"
    );
    expect(normalizeKey(" ORD-001 ", { autoTrim: true, caseInsensitive: true })).toBe(
      "ord-001"
    );
  });

  it("keeps the original case when case-insensitive mode is disabled", () => {
    expect(normalizeKey("ORD-101", { caseInsensitive: false })).toBe("ORD-101");
  });

  it("does not trim when auto-trim is disabled", () => {
    expect(normalizeKey(" ORD-101 ", { autoTrim: false, caseInsensitive: false })).toBe(
      " ORD-101 "
    );
  });

  it("collapses hidden whitespace and zero-width characters", () => {
    expect(normalizeKey("  ORD \u00a0 101\u200b ")).toBe("ord 101");
  });

  it("optionally strips punctuation separators", () => {
    expect(
      normalizeKey("ORD-101.2/A", {
        autoTrim: true,
        caseInsensitive: true,
        stripPunctuation: true,
      })
    ).toBe("ord1012a");
  });

  it("returns an empty string for nullish values", () => {
    expect(normalizeKey(null)).toBe("");
    expect(normalizeKey(undefined)).toBe("");
  });
});

describe("parseAmountToBig", () => {
  it("parses plain numbers", () => {
    expect(parseAmountToBig(1000000)?.toString()).toBe("1000000");
    expect(parseAmountToBig(12.5)?.toString()).toBe("12.5");
  });

  it("parses thousands separators", () => {
    expect(parseAmountToBig("1,000,000")?.toString()).toBe("1000000");
    expect(parseAmountToBig("1.000.000")?.toString()).toBe("1000000");
    expect(parseAmountToBig("1 234 567")?.toString()).toBe("1234567");
  });

  it("parses Vietnamese currency strings", () => {
    expect(parseAmountToBig("1.250,50 đ")?.toString()).toBe("1250.5");
    expect(parseAmountToBig("1,250.50 VND")?.toString()).toBe("1250.5");
    expect(parseAmountToBig("₫ 2.000.000")?.toString()).toBe("2000000");
  });

  it("parses negative amounts in parentheses", () => {
    expect(parseAmountToBig("(50,000)")?.toString()).toBe("-50000");
    expect(parseAmountToBig("(1,500,000)")?.toString()).toBe("-1500000");
    expect(parseAmountToBig("-15.000")?.toString()).toBe("-15000");
    expect(parseAmountToBig("15.000-")?.toString()).toBe("-15000");
  });

  it("disambiguates decimal marks", () => {
    expect(parseAmountToBig("1000.500")?.toString()).toBe("1000.5");
    expect(parseAmountToBig("0.500")?.toString()).toBe("0.5");
    expect(parseAmountToBig("12,345")?.toString()).toBe("12345");
    expect(parseAmountToBig("12,34")?.toString()).toBe("12.34");
  });

  it("never introduces floating point errors", () => {
    const delta = parseAmountToBig("0.3")!.minus(parseAmountToBig("0.1")!);
    expect(delta.toString()).toBe("0.2");
  });

  it("rejects non numeric values", () => {
    expect(parseAmountToBig("")).toBeNull();
    expect(parseAmountToBig("abc")).toBeNull();
    expect(parseAmountToBig(null)).toBeNull();
    expect(parseAmountToBig(undefined)).toBeNull();
    expect(parseAmountToBig(Number.NaN)).toBeNull();
    expect(parseAmountToBig(true)).toBeNull();
  });

  it("exposes a number convenience wrapper", () => {
    expect(parseAmount("(1,000)")).toBe(-1000);
    expect(parseAmount("n/a")).toBeNull();
  });
});

describe("isWithinTolerance", () => {
  it("compares using exact decimal arithmetic", () => {
    const delta = new Big("-1000.0000001");
    expect(isWithinTolerance(delta, 1000)).toBe(false);
    expect(isWithinTolerance(new Big("-999.99"), 1000)).toBe(true);
    expect(isWithinTolerance(new Big("0"), 0)).toBe(true);
  });
});

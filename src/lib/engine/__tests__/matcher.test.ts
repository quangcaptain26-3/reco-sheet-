import { describe, expect, it } from "vitest";
import type { RowData } from "../../../types/spreadsheet";
import type { ReconcileConfig } from "../../../types/reconciliation";
import { findDuplicateKeys, reconcileRows } from "../matcher";

function config(overrides: Partial<ReconcileConfig> = {}): ReconcileConfig {
  return {
    keyColumnA: "Mã đơn",
    keyColumnB: "Mã đơn",
    valueColumnA: "Số tiền",
    valueColumnB: "Số tiền",
    tolerance: 0,
    autoTrim: true,
    caseInsensitive: true,
    stripPunctuation: false,
    ...overrides,
  };
}

function row(key: string, amount?: string): RowData {
  return amount === undefined
    ? { "Mã đơn": key }
    : { "Mã đơn": key, "Số tiền": amount };
}

describe("reconcileRows", () => {
  it("matches identifiers after trimming and lowercasing (AC-02)", () => {
    const result = reconcileRows(
      [row(" ORD-101 ", "1,000,000")],
      [row("ord-101", "1,000,000")],
      config()
    );

    expect(result.summary.matched).toBe(1);
    expect(result.summary.discrepancy).toBe(0);
    expect(result.matched[0]?.key).toBe("ord-101");
    expect(result.matched[0]?.keyA).toBe(" ORD-101 ");
    expect(result.matched[0]?.delta).toBe("0");
  });

  it("detects a value discrepancy and computes delta = B - A (AC-03)", () => {
    const result = reconcileRows(
      [row("ORD-101", "1,000,000")],
      [row("ORD-101", "900,000")],
      config()
    );

    expect(result.summary.discrepancy).toBe(1);
    expect(result.discrepancy[0]?.delta).toBe("-100000");
    expect(result.discrepancy[0]?.valueA).toBe(1000000);
    expect(result.discrepancy[0]?.valueB).toBe(900000);
    expect(result.summary.totalDelta).toBe("-100000");
  });

  it("keeps exact decimal precision", () => {
    const result = reconcileRows(
      [row("A", "0.1")],
      [row("A", "0.3")],
      config()
    );

    expect(result.discrepancy[0]?.delta).toBe("0.2");
  });

  it("honours the absolute tolerance", () => {
    const strict = reconcileRows(
      [row("ORD-1", "1,000,000")],
      [row("ORD-1", "999,500")],
      config()
    );
    expect(strict.summary.discrepancy).toBe(1);

    const tolerant = reconcileRows(
      [row("ORD-1", "1,000,000")],
      [row("ORD-1", "999,500")],
      config({ tolerance: 1000 })
    );
    expect(tolerant.summary.matched).toBe(1);
    expect(tolerant.summary.discrepancy).toBe(0);
  });

  it("separates rows that only exist in A or B (AC-04)", () => {
    const result = reconcileRows(
      [row("A-1", "10"), row("A-2", "20")],
      [row("B-1", "10"), row("A-2", "20")],
      config()
    );

    expect(result.summary.onlyInA).toBe(1);
    expect(result.summary.onlyInB).toBe(1);
    expect(result.onlyInA[0]?.key).toBe("a-1");
    expect(result.onlyInB[0]?.key).toBe("b-1");
    expect(result.onlyInA[0]?.rawA).toEqual(row("A-1", "10"));
    expect(result.onlyInB[0]?.rawB).toEqual(row("B-1", "10"));
  });

  it("pairs duplicate keys one-to-one and reports duplicates", () => {
    const result = reconcileRows(
      [row("ORD-1", "100"), row("ORD-1", "200")],
      [row("ORD-1", "100"), row("ORD-1", "250")],
      config()
    );

    expect(result.summary.matched).toBe(1);
    expect(result.summary.discrepancy).toBe(1);
    expect(result.summary.onlyInA).toBe(0);
    expect(result.summary.onlyInB).toBe(0);
    expect(result.duplicatesA).toEqual([{ key: "ord-1", occurrences: 2 }]);
    expect(result.duplicatesB).toEqual([{ key: "ord-1", occurrences: 2 }]);
  });

  it("leaves the extra duplicate in file A as onlyInA", () => {
    const result = reconcileRows(
      [row("ORD-1", "100"), row("ORD-1", "200")],
      [row("ORD-1", "100")],
      config()
    );

    expect(result.summary.matched).toBe(1);
    expect(result.summary.onlyInA).toBe(1);
    expect(result.onlyInA[0]?.valueA).toBe(200);
  });

  it("skips rows with an empty key instead of matching them together", () => {
    const result = reconcileRows(
      [row("", "100"), row("   ", "200"), row("A", "1")],
      [row("", "300"), row("A", "1")],
      config()
    );

    expect(result.summary.skippedA).toBe(2);
    expect(result.summary.skippedB).toBe(1);
    expect(result.summary.matched).toBe(1);
    expect(result.summary.onlyInA).toBe(0);
    expect(result.summary.onlyInB).toBe(0);
  });

  it("matches on identifiers only when no value columns are selected", () => {
    const result = reconcileRows(
      [row("A"), row("B")],
      [row("a"), row("C")],
      config({ valueColumnA: null, valueColumnB: null })
    );

    expect(result.summary.matched).toBe(1);
    expect(result.summary.onlyInA).toBe(1);
    expect(result.summary.onlyInB).toBe(1);
    expect(result.matched[0]?.delta).toBeNull();
  });

  it("marks unparseable amounts as discrepancies", () => {
    const result = reconcileRows(
      [row("A", "không có")],
      [row("A", "100")],
      config()
    );

    expect(result.summary.discrepancy).toBe(1);
    expect(result.discrepancy[0]?.valueA).toBeNull();
    expect(result.discrepancy[0]?.delta).toBeNull();
  });

  it("sums discrepancies exactly", () => {
    const result = reconcileRows(
      [row("A", "1000"), row("B", "500")],
      [row("A", "900"), row("B", "650")],
      config()
    );

    expect(result.summary.totalDelta).toBe("50");
  });

  it("keeps the normalized config in the result", () => {
    const input = config({ tolerance: 10 });
    const result = reconcileRows([row("A", "1")], [row("A", "1")], input);

    expect(result.config).toEqual(input);
    expect(result.config).not.toBe(input);
  });

  it("rejects incomplete configurations", () => {
    expect(() =>
      reconcileRows([row("A")], [row("A")], config({ keyColumnB: "" }))
    ).toThrow(/cột khóa/i);

    expect(() =>
      reconcileRows(
        [row("A")],
        [row("A")],
        config({ valueColumnB: null })
      )
    ).toThrow(/cột giá trị/i);

    expect(() =>
      reconcileRows([row("A")], [row("A")], config({ tolerance: -1 }))
    ).toThrow(/dung sai/i);
  });
});

describe("findDuplicateKeys", () => {
  it("counts normalized duplicates and sorts by frequency", () => {
    const duplicates = findDuplicateKeys(
      [row("A"), row("a"), row("B"), row("B"), row("B")],
      "Mã đơn",
      { autoTrim: true, caseInsensitive: true }
    );

    expect(duplicates).toEqual([
      { key: "b", occurrences: 3 },
      { key: "a", occurrences: 2 },
    ]);
  });

  it("ignores empty keys", () => {
    expect(findDuplicateKeys([row(""), row("  ")], "Mã đơn")).toEqual([]);
  });
});

describe("performance", () => {
  it("reconciles 10,000 rows in under 2 seconds", () => {
    const rowsA: RowData[] = Array.from({ length: 10000 }, (_, index) => ({
      "Mã đơn": ` ORD-${index} `,
      "Số tiền": `${(index + 1) * 1000}`,
    }));
    const rowsB: RowData[] = Array.from({ length: 10000 }, (_, index) => ({
      "Mã đơn": `ord-${index}`,
      "Số tiền": index % 100 === 0 ? `${(index + 1) * 1000 + 500}` : `${(index + 1) * 1000}`,
    }));

    const startedAt = performance.now();
    const result = reconcileRows(rowsA, rowsB, config());
    const elapsedMs = performance.now() - startedAt;

    expect(result.summary.matched).toBe(9900);
    expect(result.summary.discrepancy).toBe(100);
    expect(elapsedMs).toBeLessThan(2000);
  });
});

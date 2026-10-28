import { describe, expect, it } from "vitest";
import sampleA from "./fixtures/sample_A.json";
import sampleB from "./fixtures/sample_B.json";
import { reconcileRows } from "@/lib/engine/matcher";
import type { RowData } from "@/types/spreadsheet";
import type { ReconcileConfig } from "@/types/reconciliation";

const CONFIG: ReconcileConfig = {
  keyColumnA: "Mã đơn",
  keyColumnB: "Mã giao dịch",
  valueColumnA: "Số tiền",
  valueColumnB: "Số tiền",
  tolerance: 0,
  autoTrim: true,
  caseInsensitive: true,
  stripPunctuation: false,
};

describe("mock integration (fixtures)", () => {
  it("classifies the four acceptance groups", () => {
    const result = reconcileRows(
      sampleA as RowData[],
      sampleB as RowData[],
      CONFIG
    );

    expect(result.summary.matched).toBe(2);
    expect(result.summary.discrepancy).toBe(1);
    expect(result.summary.onlyInA).toBe(1);
    expect(result.summary.onlyInB).toBe(1);
    expect(result.summary.totalDelta).toBe("-100000");
    expect(result.summary.skippedA).toBe(0);
    expect(result.summary.skippedB).toBe(0);
  });

  it("does not emit any duplicate warning for the fixtures", () => {
    const result = reconcileRows(
      sampleA as RowData[],
      sampleB as RowData[],
      CONFIG
    );

    expect(result.duplicatesA).toEqual([]);
    expect(result.duplicatesB).toEqual([]);
  });
});

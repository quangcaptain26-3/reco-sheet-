/**
 * Pure 1-to-1 reconciliation engine.
 *
 * Complexity: O(N + M). Rows from file A are indexed in a hash map (bucket per
 * normalised key). File B is streamed once; the first unpaired A row with the
 * same key is consumed. Remaining A rows become "onlyInA".
 */

import Big from "big.js";
import type { RowData } from "../../types/spreadsheet";
import type {
  DiffRecord,
  DuplicateKeySummary,
  MatchStatus,
  ReconcileConfig,
  ReconcileResult,
  ReconcileSummary,
} from "../../types/reconciliation";
import { isWithinTolerance, normalizeKey, parseAmountToBig } from "./normalizer";

interface IndexedRow {
  raw: RowData;
  /** 1-based Excel row (the header row is row 1). */
  rowNumber: number;
}

interface Bucket {
  rows: IndexedRow[];
  cursor: number;
}

function keyOptions(config: ReconcileConfig) {
  return {
    autoTrim: config.autoTrim,
    caseInsensitive: config.caseInsensitive,
    stripPunctuation: config.stripPunctuation,
  };
}

function rawText(row: RowData, column: string): string {
  const value = row[column];
  return value === null || value === undefined ? "" : String(value);
}

/**
 * List duplicate identifiers for a given key column, sorted by frequency.
 * Used to warn the user before running the reconciliation.
 */
export function findDuplicateKeys(
  rows: RowData[],
  column: string,
  options: { autoTrim?: boolean; caseInsensitive?: boolean; stripPunctuation?: boolean } = {}
): DuplicateKeySummary[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const key = normalizeKey(row[column], options);
    if (!key) {
      continue;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, occurrences]) => occurrences > 1)
    .map(([key, occurrences]) => ({ key, occurrences }))
    .sort(
      (left, right) =>
        right.occurrences - left.occurrences || left.key.localeCompare(right.key)
    );
}

function toNumberOrNull(value: Big | null): number | null {
  return value ? value.toNumber() : null;
}

interface AmountPair {
  valueA: number | null;
  valueB: number | null;
  delta: string | null;
  exactDelta: Big | null;
}

const EMPTY_AMOUNTS: AmountPair = {
  valueA: null,
  valueB: null,
  delta: null,
  exactDelta: null,
};

function amountPair(
  rowA: RowData,
  rowB: RowData,
  config: ReconcileConfig
): AmountPair {
  if (!config.valueColumnA || !config.valueColumnB) {
    return EMPTY_AMOUNTS;
  }

  const bigA = parseAmountToBig(rowA[config.valueColumnA]);
  const bigB = parseAmountToBig(rowB[config.valueColumnB]);

  if (!bigA || !bigB) {
    return {
      valueA: toNumberOrNull(bigA),
      valueB: toNumberOrNull(bigB),
      delta: null,
      exactDelta: null,
    };
  }

  const exactDelta = bigB.minus(bigA);

  return {
    valueA: bigA.toNumber(),
    valueB: bigB.toNumber(),
    delta: exactDelta.toString(),
    exactDelta,
  };
}

function sideAmount(
  row: RowData,
  column: string | null,
  side: "A" | "B"
): AmountPair {
  const amount = column ? parseAmountToBig(row[column]) : null;

  return {
    valueA: side === "A" ? toNumberOrNull(amount) : null,
    valueB: side === "B" ? toNumberOrNull(amount) : null,
    delta: null,
    exactDelta: null,
  };
}

function buildRecord(
  status: MatchStatus,
  key: string,
  rowA: IndexedRow | null,
  rowB: IndexedRow | null,
  config: ReconcileConfig,
  amounts: AmountPair
): DiffRecord {
  return {
    id: `${status}:${key}:${rowA?.rowNumber ?? 0}:${rowB?.rowNumber ?? 0}`,
    status,
    key,
    keyA: rowA ? rawText(rowA.raw, config.keyColumnA) : null,
    keyB: rowB ? rawText(rowB.raw, config.keyColumnB) : null,
    valueA: amounts.valueA,
    valueB: amounts.valueB,
    delta: amounts.delta,
    rowNumberA: rowA?.rowNumber ?? null,
    rowNumberB: rowB?.rowNumber ?? null,
    rawA: rowA?.raw ?? null,
    rawB: rowB?.raw ?? null,
  };
}

function validateConfig(config: ReconcileConfig): void {
  if (!config.keyColumnA || !config.keyColumnB) {
    throw new Error("Vui lòng chọn cột khóa cho cả hai tệp trước khi đối soát.");
  }

  const hasValueA = Boolean(config.valueColumnA);
  const hasValueB = Boolean(config.valueColumnB);

  if (hasValueA !== hasValueB) {
    throw new Error(
      "Cột giá trị phải được chọn ở cả hai tệp hoặc bỏ trống ở cả hai tệp."
    );
  }

  if (!Number.isFinite(config.tolerance) || config.tolerance < 0) {
    throw new Error("Dung sai phải là một số không âm.");
  }
}

/**
 * Reconcile two row collections.
 *
 * `delta` follows the specification: Δ = Value(B) − Value(A).
 */
export function reconcileRows(
  rowsA: RowData[],
  rowsB: RowData[],
  config: ReconcileConfig
): ReconcileResult {
  validateConfig(config);

  const options = keyOptions(config);
  const buckets = new Map<string, Bucket>();

  let skippedA = 0;
  rowsA.forEach((raw, index) => {
    const key = normalizeKey(raw[config.keyColumnA], options);
    if (!key) {
      skippedA += 1;
      return;
    }

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { rows: [], cursor: 0 };
      buckets.set(key, bucket);
    }

    bucket.rows.push({ raw, rowNumber: index + 2 });
  });

  const records: DiffRecord[] = [];
  let skippedB = 0;

  rowsB.forEach((raw, index) => {
    const key = normalizeKey(raw[config.keyColumnB], options);
    if (!key) {
      skippedB += 1;
      return;
    }

    const bucket = buckets.get(key);
    const candidate =
      bucket && bucket.cursor < bucket.rows.length
        ? bucket.rows[bucket.cursor++]
        : null;

    if (!candidate) {
      records.push(
        buildRecord(
          "onlyInB",
          key,
          null,
          { raw, rowNumber: index + 2 },
          config,
          sideAmount(raw, config.valueColumnB, "B")
        )
      );
      return;
    }

    const values = amountPair(candidate.raw, raw, config);
    let status: MatchStatus = "matched";

    if (config.valueColumnA && config.valueColumnB) {
      if (!values.exactDelta) {
        status = "discrepancy";
      } else if (!isWithinTolerance(values.exactDelta, config.tolerance)) {
        status = "discrepancy";
      }
    }

    records.push(
      buildRecord(
        status,
        key,
        candidate,
        { raw, rowNumber: index + 2 },
        config,
        values
      )
    );
  });

  for (const [key, bucket] of buckets) {
    for (let index = bucket.cursor; index < bucket.rows.length; index += 1) {
      const indexedRow = bucket.rows[index];
      records.push(
        buildRecord(
          "onlyInA",
          key,
          indexedRow,
          null,
          config,
          sideAmount(indexedRow.raw, config.valueColumnA, "A")
        )
      );
    }
  }

  const matched = records
    .filter((record) => record.status === "matched")
    .sort((left, right) => left.key.localeCompare(right.key));

  const discrepancy = records
    .filter((record) => record.status === "discrepancy")
    .sort((left, right) => {
      const leftDelta = left.delta ? new Big(left.delta).abs() : null;
      const rightDelta = right.delta ? new Big(right.delta).abs() : null;

      if (leftDelta && rightDelta && !leftDelta.eq(rightDelta)) {
        return rightDelta.cmp(leftDelta);
      }
      if (leftDelta && !rightDelta) {
        return -1;
      }
      if (!leftDelta && rightDelta) {
        return 1;
      }
      return left.key.localeCompare(right.key);
    });

  const onlyInA = records
    .filter((record) => record.status === "onlyInA")
    .sort((left, right) => left.key.localeCompare(right.key));

  const onlyInB = records
    .filter((record) => record.status === "onlyInB")
    .sort((left, right) => left.key.localeCompare(right.key));

  const totalDelta = discrepancy.reduce((accumulator, record) => {
    if (!record.delta) {
      return accumulator;
    }
    return accumulator.plus(new Big(record.delta));
  }, new Big(0));

  const summary: ReconcileSummary = {
    totalA: rowsA.length,
    totalB: rowsB.length,
    skippedA,
    skippedB,
    matched: matched.length,
    discrepancy: discrepancy.length,
    onlyInA: onlyInA.length,
    onlyInB: onlyInB.length,
    totalDelta: totalDelta.toString(),
  };

  return {
    matched,
    discrepancy,
    onlyInA,
    onlyInB,
    summary,
    duplicatesA: findDuplicateKeys(rowsA, config.keyColumnA, options),
    duplicatesB: findDuplicateKeys(rowsB, config.keyColumnB, options),
    config: { ...config },
  };
}

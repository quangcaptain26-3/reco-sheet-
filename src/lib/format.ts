/** Presentation helpers (Vietnamese number/date formatting). */

const amountFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 3,
});

const countFormatter = new Intl.NumberFormat("vi-VN");

export function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return amountFormatter.format(value);
}

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

/** Format an exact delta string with an explicit sign. */
export function formatDelta(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }

  if (numeric === 0) {
    return "0";
  }

  const formatted = amountFormatter.format(Math.abs(numeric));
  return numeric > 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)} ms`;
  }
  return `${(milliseconds / 1000).toFixed(2)} s`;
}

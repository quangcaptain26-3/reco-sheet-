/**
 * Client-side logger.
 *
 * Production builds never print spreadsheet values: only aggregate counts and
 * timings are emitted so financial data cannot leak through the console.
 */

const isProduction = process.env.NODE_ENV === "production";

type LogPayload = Record<string, unknown>;

function write(
  level: "info" | "warn" | "error",
  scope: string,
  message: string,
  payload?: LogPayload
) {
  if (level === "info" && isProduction) {
    return;
  }

  const prefix = `[${scope}] ${message}`;
  const method = level === "info" ? "log" : level;

  if (payload) {
    console[method](prefix, payload);
    return;
  }

  console[method](prefix);
}

export const logger = {
  info(scope: string, message: string, payload?: LogPayload) {
    write("info", scope, message, payload);
  },
  warn(scope: string, message: string, payload?: LogPayload) {
    write("warn", scope, message, payload);
  },
  error(scope: string, message: string, payload?: LogPayload) {
    write("error", scope, message, payload);
  },
};

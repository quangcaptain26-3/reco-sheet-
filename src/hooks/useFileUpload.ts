"use client";

import { useCallback, useRef, useState } from "react";
import { parseSpreadsheetFile } from "@/lib/engine/parser";
import { logger } from "@/lib/logger";
import {
  MAX_FILE_SIZE_BYTES,
  SpreadsheetParseError,
  type ParsedSheet,
} from "@/types/spreadsheet";

export type FileSlot = "a" | "b";

export interface FileSlotState {
  sheet: ParsedSheet | null;
  isParsing: boolean;
  error: string | null;
}

interface FileUploadState {
  a: FileSlotState;
  b: FileSlotState;
}

const EMPTY_SLOT: FileSlotState = {
  sheet: null,
  isParsing: false,
  error: null,
};

function initialState(): FileUploadState {
  return { a: { ...EMPTY_SLOT }, b: { ...EMPTY_SLOT } };
}

function validateFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (![".xlsx", ".xls", ".csv"].includes(extension)) {
    return "Định dạng không hỗ trợ. Vui lòng chọn tệp .xlsx, .xls hoặc .csv.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Tệp vượt quá 10MB. Vui lòng chia nhỏ dữ liệu trước khi đối soát.";
  }

  return null;
}

function errorMessage(error: unknown): string {
  if (error instanceof SpreadsheetParseError) {
    return error.message;
  }

  return "Không thể đọc tệp này. Hãy kiểm tra định dạng và thử lại.";
}

/**
 * Reads file A and file B into memory (browser only).
 * Never uploads anything: the parser works on an ArrayBuffer.
 */
export function useFileUpload() {
  const [slots, setSlots] = useState<FileUploadState>(initialState);
  const requestIds = useRef<Record<FileSlot, number>>({ a: 0, b: 0 });

  const patchSlot = useCallback((slot: FileSlot, patch: Partial<FileSlotState>) => {
    setSlots((previous) => ({
      ...previous,
      [slot]: { ...previous[slot], ...patch },
    }));
  }, []);

  const loadFile = useCallback(
    async (slot: FileSlot, file: File): Promise<boolean> => {
      const requestId = requestIds.current[slot] + 1;
      requestIds.current[slot] = requestId;

      const validationError = validateFile(file);

      if (validationError) {
        patchSlot(slot, { sheet: null, isParsing: false, error: validationError });
        return false;
      }

      patchSlot(slot, { sheet: null, isParsing: true, error: null });

      try {
        const sheet = await parseSpreadsheetFile(file);

        if (requestIds.current[slot] !== requestId) {
          return false;
        }

        patchSlot(slot, { sheet, isParsing: false, error: null });

        logger.info("FileUpload", "Parsed spreadsheet", {
          slot,
          rows: sheet.rowCount,
          columns: sheet.columns.length,
        });

        return true;
      } catch (error) {
        if (requestIds.current[slot] !== requestId) {
          return false;
        }

        patchSlot(slot, {
          sheet: null,
          isParsing: false,
          error: errorMessage(error),
        });

        logger.warn("FileUpload", "Failed to parse spreadsheet", {
          slot,
          code: error instanceof SpreadsheetParseError ? error.code : "UNKNOWN",
        });

        return false;
      }
    },
    [patchSlot]
  );

  const removeFile = useCallback((slot: FileSlot) => {
    requestIds.current[slot] += 1;
    setSlots((previous) => ({ ...previous, [slot]: { ...EMPTY_SLOT } }));
  }, []);

  const clearError = useCallback((slot: FileSlot) => {
    patchSlot(slot, { error: null });
  }, [patchSlot]);

  const reset = useCallback(() => {
    requestIds.current.a += 1;
    requestIds.current.b += 1;
    setSlots(initialState());
  }, []);

  return {
    fileA: slots.a.sheet,
    fileB: slots.b.sheet,
    statusA: slots.a,
    statusB: slots.b,
    isBusy: slots.a.isParsing || slots.b.isParsing,
    loadFile,
    removeFile,
    clearError,
    reset,
  };
}

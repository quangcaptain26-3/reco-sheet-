"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Database,
  FileSpreadsheet,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StepHeading } from "@/components/shared/StepHeading";
import { InlineAlert } from "@/components/shared/InlineAlert";
import { DropzoneArea } from "@/components/upload/DropzoneArea";
import { ColumnSelector } from "@/components/mapping/ColumnSelector";
import { ToleranceInput } from "@/components/mapping/ToleranceInput";
import { CleanOptionsToggle } from "@/components/mapping/CleanOptionsToggle";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ResultTabs } from "@/components/results/ResultTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFileUpload, type FileSlot } from "@/hooks/useFileUpload";
import { useReconciler } from "@/hooks/useReconciler";
import { useExportExcel } from "@/hooks/useExportExcel";
import { findDuplicateKeys } from "@/lib/engine/matcher";
import { formatCount } from "@/lib/format";
import type { ReconcileConfig } from "@/types/reconciliation";

export default function HomePage() {
  const {
    fileA,
    fileB,
    statusA,
    statusB,
    isBusy,
    loadFile,
    removeFile,
    clearError,
    reset: resetUpload,
  } = useFileUpload();

  const {
    result,
    isRunning,
    error: reconcileError,
    run,
    reset: resetReconciliation,
    clearError: clearReconcileError,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    filteredRecords,
  } = useReconciler();

  const {
    isExporting,
    error: exportError,
    exportExcel,
    clearError: clearExportError,
  } = useExportExcel();

  const [keyColumnA, setKeyColumnA] = useState("");
  const [keyColumnB, setKeyColumnB] = useState("");
  const [valueColumnA, setValueColumnA] = useState("");
  const [valueColumnB, setValueColumnB] = useState("");
  const [tolerance, setTolerance] = useState("0");
  const [autoTrim, setAutoTrim] = useState(true);
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [stripPunctuation, setStripPunctuation] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const invalidateMappingResult = useCallback(() => {
    resetReconciliation();
    setFormError(null);
  }, [resetReconciliation]);

  const handleSelectFile = useCallback(
    async (slot: FileSlot, file: File) => {
      if (slot === "a") {
        setKeyColumnA("");
        setValueColumnA("");
      } else {
        setKeyColumnB("");
        setValueColumnB("");
      }

      invalidateMappingResult();
      await loadFile(slot, file);
    },
    [invalidateMappingResult, loadFile]
  );

  const handleRemoveFile = useCallback(
    (slot: FileSlot) => {
      if (slot === "a") {
        setKeyColumnA("");
        setValueColumnA("");
      } else {
        setKeyColumnB("");
        setValueColumnB("");
      }

      invalidateMappingResult();
      removeFile(slot);
    },
    [invalidateMappingResult, removeFile]
  );

  useEffect(() => {
    if (!result) {
      return;
    }

    const timer = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [result]);

  const toleranceValue = useMemo(() => {
    const normalized = tolerance.replace(",", ".").trim();
    if (!normalized) {
      return 0;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [tolerance]);

  const toleranceError = useMemo(() => {
    if (!Number.isFinite(toleranceValue) || toleranceValue < 0) {
      return "Dung sai phải là một số không âm.";
    }
    return null;
  }, [toleranceValue]);

  const cleanOptions = useMemo(
    () => ({ autoTrim, caseInsensitive, stripPunctuation }),
    [autoTrim, caseInsensitive, stripPunctuation]
  );

  const duplicatesA = useMemo(() => {
    if (!fileA || !keyColumnA) {
      return [];
    }
    return findDuplicateKeys(fileA.rows, keyColumnA, cleanOptions);
  }, [fileA, keyColumnA, cleanOptions]);

  const duplicatesB = useMemo(() => {
    if (!fileB || !keyColumnB) {
      return [];
    }
    return findDuplicateKeys(fileB.rows, keyColumnB, cleanOptions);
  }, [fileB, keyColumnB, cleanOptions]);

  const duplicateSamples = useMemo(() => {
    const samples = [...duplicatesA, ...duplicatesB]
      .slice(0, 4)
      .map((duplicate) => `${duplicate.key} ×${duplicate.occurrences}`);
    return samples.join(", ");
  }, [duplicatesA, duplicatesB]);

  const canRun =
    Boolean(fileA && fileB && keyColumnA && keyColumnB) &&
    !isRunning &&
    !isBusy &&
    !toleranceError;

  const handleRun = useCallback(async () => {
    setFormError(null);

    if (!fileA || !fileB) {
      setFormError("Vui lòng tải đủ tệp A và tệp B trước khi đối soát.");
      return;
    }

    if (!keyColumnA || !keyColumnB) {
      setFormError("Vui lòng chọn cột khóa (mã định danh) cho cả hai tệp.");
      return;
    }

    if (!Number.isFinite(toleranceValue) || toleranceValue < 0) {
      setFormError("Dung sai phải là một số không âm.");
      return;
    }

    if (Boolean(valueColumnA) !== Boolean(valueColumnB)) {
      setFormError(
        "Cột giá trị phải được chọn ở cả hai tệp, hoặc để trống ở cả hai để chỉ đối chiếu mã."
      );
      return;
    }

    const config: ReconcileConfig = {
      keyColumnA,
      keyColumnB,
      valueColumnA: valueColumnA || null,
      valueColumnB: valueColumnB || null,
      tolerance: toleranceValue,
      autoTrim,
      caseInsensitive,
      stripPunctuation,
    };

    await run(fileA.rows, fileB.rows, config);
  }, [
    fileA,
    fileB,
    keyColumnA,
    keyColumnB,
    valueColumnA,
    valueColumnB,
    toleranceValue,
    autoTrim,
    caseInsensitive,
    stripPunctuation,
    run,
  ]);

  const handleExport = useCallback(async () => {
    if (!result) {
      return;
    }

    await exportExcel(result, {
      fileNameA: fileA?.fileName,
      fileNameB: fileB?.fileName,
      sheetNameA: fileA?.sheetName,
      sheetNameB: fileB?.sheetName,
      elapsedMs: result.elapsedMs,
    });
  }, [result, fileA, fileB, exportExcel]);

  const handleReRun = useCallback(() => {
    void handleRun();
  }, [handleRun]);

  const handleClearAll = useCallback(() => {
    if (fileA || fileB || result) {
      const confirmed = window.confirm(
        "Xoá cả hai tệp, cấu hình đang chọn và kết quả hiện tại?"
      );
      if (!confirmed) {
        return;
      }
    }

    resetUpload();
    resetReconciliation();
    setFormError(null);
    setKeyColumnA("");
    setKeyColumnB("");
    setValueColumnA("");
    setValueColumnB("");
    setTolerance("0");
    setAutoTrim(true);
    setCaseInsensitive(true);
    setStripPunctuation(false);
  }, [fileA, fileB, result, resetUpload, resetReconciliation]);

  const hasFiles = Boolean(fileA || fileB);
  const bothFiles = Boolean(fileA && fileB);
  const hasDuplicateWarning = duplicatesA.length > 0 || duplicatesB.length > 0;

  return (
    <div id="top" className="flex min-h-full flex-1 flex-col bg-background">
      <Header />

      <main className="relative flex-1">
        <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-16">
          <section className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
              <Sparkles className="size-3.5 text-emerald-600" aria-hidden />
              Công cụ đối soát cho kế toán, vận hành & logistics
            </span>

            <h1 className="mt-4 font-heading text-3xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-[2.6rem]">
              Đối soát Excel{" "}
              <span className="text-emerald-700">trong vài giây</span>, không cần
              VLOOKUP.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Kéo thả hai bảng tính, chọn cột khóa và cột số tiền. RecoSheet tự làm
              sạch dữ liệu bẩn, so khớp một-một trong bộ nhớ và bóc tách mọi chênh
              lệch — tất cả trong bộ nhớ trình duyệt của bạn.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/70 px-2 py-1">
                <FileSpreadsheet className="size-3.5" aria-hidden />
                Excel & CSV
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/70 px-2 py-1">
                <Database className="size-3.5" aria-hidden />
                Chênh lệch chính xác
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/70 px-2 py-1">
                <Clock3 className="size-3.5" aria-hidden />
                10.000 dòng trong ~1 giây
              </span>
            </div>
          </section>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-950">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden />
            <div>
              <p className="font-medium">Dữ liệu không rời khỏi máy bạn.</p>
              <p className="mt-0.5 text-emerald-900/80">
                Không API, không upload, không lưu trữ. Tệp được đọc vào RAM, tính
                toán và xuất báo cáo ngay tại tab này.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <StepHeading
                  step={1}
                  title="Tải hai bảng tính"
                  description="Tệp A là nguồn đối chiếu (sổ quỹ, đơn xuất kho). Tệp B là nguồn so sánh (sao kê, báo cáo đối tác)."
                  state={bothFiles ? "done" : "active"}
                />
                {hasFiles ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-muted-foreground"
                  >
                    <Trash2 aria-hidden />
                    Xoá tất cả
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-2">
                <DropzoneArea
                  id="file-a"
                  badge="Tệp A"
                  roleLabel="Nguồn đối chiếu"
                  accent="emerald"
                  state={statusA}
                  onFileSelected={(file) => {
                    void handleSelectFile("a", file);
                  }}
                  onRemove={() => handleRemoveFile("a")}
                  onDismissError={() => clearError("a")}
                />
                <DropzoneArea
                  id="file-b"
                  badge="Tệp B"
                  roleLabel="Nguồn so sánh"
                  accent="sky"
                  state={statusB}
                  onFileSelected={(file) => {
                    void handleSelectFile("b", file);
                  }}
                  onRemove={() => handleRemoveFile("b")}
                  onDismissError={() => clearError("b")}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-5 py-3 text-[12px] text-muted-foreground">
                <span>
                  Chưa có tệp? Thử ngay với{" "}
                  <a
                    href="/sample-data/sample_internal_ledger.xlsx"
                    className="font-medium text-foreground underline underline-offset-2"
                    download
                  >
                    sổ quỹ mẫu (.xlsx)
                  </a>{" "}
                  và{" "}
                  <a
                    href="/sample-data/sample_bank_statement.csv"
                    className="font-medium text-foreground underline underline-offset-2"
                    download
                  >
                    sao kê mẫu (.csv)
                  </a>
                  .
                </span>
                <span className="inline-flex items-center gap-1">
                  <Lock className="size-3" aria-hidden />
                  Đọc cục bộ, không gửi dữ liệu
                </span>
              </div>
            </Card>

            <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <StepHeading
                  step={2}
                  title="Thiết lập quy tắc đối soát"
                  description="Chọn cột định danh và cột giá trị tương ứng. Bật làm sạch thông minh để xử lý khoảng trắng ẩn và hoa/thường."
                  state={result ? "done" : "active"}
                />
                {bothFiles ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    Đã tải đủ 2 tệp
                  </Badge>
                ) : null}
              </div>

              {hasFiles ? (
                <div className="space-y-5 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4 rounded-lg border border-border/70 bg-muted/15 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold tracking-wide uppercase">
                        Tệp A · Nguồn đối chiếu
                      </p>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {fileA ? formatCount(fileA.rowCount) + " dòng" : "Chưa tải"}
                      </span>
                    </div>

                    <ColumnSelector
                      id="key-column-a"
                      label="Cột khóa (mã định danh)"
                      columns={fileA?.columns ?? []}
                      value={keyColumnA}
                      onChange={(value) => {
                        setKeyColumnA(value);
                        invalidateMappingResult();
                      }}
                      hint={
                        fileA
                          ? keyColumnA
                            ? "Ví dụ: Mã đơn, Số hóa đơn, Số vận đơn."
                            : "Bắt buộc — chọn cột khóa để bật đối soát."
                          : "Tải tệp A ở bước 1 để chọn cột."
                      }
                      hintTone={fileA && !keyColumnA ? "warning" : "muted"}
                      invalid={Boolean(fileA && !keyColumnA)}
                      required
                    />

                    <ColumnSelector
                      id="value-column-a"
                      label="Cột giá trị (tùy chọn)"
                      columns={fileA?.columns ?? []}
                      value={valueColumnA}
                      onChange={(value) => {
                        setValueColumnA(value);
                        invalidateMappingResult();
                      }}
                      placeholder="Không so sánh giá trị"
                      hint="Bỏ trống nếu chỉ cần đối chiếu mã."
                    />
                  </div>

                  <div className="space-y-4 rounded-lg border border-border/70 bg-muted/15 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold tracking-wide uppercase">
                        Tệp B · Nguồn so sánh
                      </p>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {fileB ? formatCount(fileB.rowCount) + " dòng" : "Chưa tải"}
                      </span>
                    </div>

                    <ColumnSelector
                      id="key-column-b"
                      label="Cột khóa (mã định danh)"
                      columns={fileB?.columns ?? []}
                      value={keyColumnB}
                      onChange={(value) => {
                        setKeyColumnB(value);
                        invalidateMappingResult();
                      }}
                      hint={
                        fileB
                          ? keyColumnB
                            ? "Nên chọn cột có cùng ý nghĩa với tệp A."
                            : "Bắt buộc — chọn cột khóa để bật đối soát."
                          : "Tải tệp B ở bước 1 để chọn cột."
                      }
                      hintTone={fileB && !keyColumnB ? "warning" : "muted"}
                      invalid={Boolean(fileB && !keyColumnB)}
                      required
                    />

                    <ColumnSelector
                      id="value-column-b"
                      label="Cột giá trị (tùy chọn)"
                      columns={fileB?.columns ?? []}
                      value={valueColumnB}
                      onChange={(value) => {
                        setValueColumnB(value);
                        invalidateMappingResult();
                      }}
                      placeholder="Không so sánh giá trị"
                      hint="Chọn cùng loại giá trị với tệp A để tính Δ."
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ToleranceInput
                    id="tolerance"
                    value={tolerance}
                    error={toleranceError}
                    onChange={(value) => {
                      setTolerance(value);
                      invalidateMappingResult();
                    }}
                  />
                  <CleanOptionsToggle
                    autoTrim={autoTrim}
                    caseInsensitive={caseInsensitive}
                    stripPunctuation={stripPunctuation}
                    onAutoTrimChange={(checked) => {
                      setAutoTrim(checked);
                      invalidateMappingResult();
                    }}
                    onCaseInsensitiveChange={(checked) => {
                      setCaseInsensitive(checked);
                      invalidateMappingResult();
                    }}
                    onStripPunctuationChange={(checked) => {
                      setStripPunctuation(checked);
                      invalidateMappingResult();
                    }}
                  />
                </div>

                {hasDuplicateWarning ? (
                  <InlineAlert
                    variant="warning"
                    title={`Phát hiện mã trùng lặp: A có ${formatCount(
                      duplicatesA.length
                    )} mã, B có ${formatCount(duplicatesB.length)} mã`}
                  >
                    Hệ thống vẫn chạy bình thường và ghép từng cặp theo thứ tự xuất
                    hiện. Nên kiểm tra lại các mã: {duplicateSamples}
                    {duplicatesA.length + duplicatesB.length > 4 ? "…" : ""}
                  </InlineAlert>
                ) : null}

                {formError ? (
                  <InlineAlert variant="error" onDismiss={() => setFormError(null)}>
                    {formError}
                  </InlineAlert>
                ) : null}

                {reconcileError ? (
                  <InlineAlert variant="error" onDismiss={clearReconcileError}>
                    {reconcileError}
                  </InlineAlert>
                ) : null}

                {isBusy ? (
                  <InlineAlert variant="info">
                    Đang đọc tệp vào bộ nhớ trình duyệt. Vui lòng chờ trong giây lát.
                  </InlineAlert>
                ) : null}

                {bothFiles && (!keyColumnA || !keyColumnB) ? (
                  <p
                    role="status"
                    className="text-[11px] font-medium text-amber-700"
                  >
                    Chọn cột khóa cho cả hai tệp để bật đối soát.
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
                    So khớp một-một trong bộ nhớ (O(N+M)); phép trừ tiền tệ dùng số
                    thập phân chính xác.
                  </p>

                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      void handleRun();
                    }}
                    disabled={!canRun}
                    className="gap-2 px-4"
                  >
                    {isRunning ? (
                      <Loader2 className="animate-spin" aria-hidden />
                    ) : (
                      <ArrowRight aria-hidden />
                    )}
                    {isRunning ? "Đang đối soát…" : "Bắt đầu đối soát"}
                  </Button>
                </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Tải ít nhất một tệp ở bước 1 để chọn cột khóa và cột giá trị.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-a")?.click()}
                    >
                      Chọn tệp A
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-b")?.click()}
                    >
                      Chọn tệp B
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {result ? (
              <section
                ref={resultsRef}
                className="scroll-mt-20 space-y-4 pt-1"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <StepHeading
                    step={3}
                    title="Kết quả đối soát"
                    description={`Đã đối chiếu ${formatCount(
                      result.summary.matched + result.summary.discrepancy
                    )} cặp khóa và phân loại thành 4 nhóm. Bấm vào tab để xem chi tiết.`}
                    state="done"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReRun}
                    disabled={isRunning || !canRun}
                  >
                    {isRunning ? (
                      <Loader2 className="animate-spin" aria-hidden />
                    ) : (
                      <RotateCcw aria-hidden />
                    )}
                    Đối soát lại
                  </Button>
                </div>

                <SummaryCards
                  summary={result.summary}
                  config={result.config}
                  elapsedMs={result.elapsedMs}
                />

                <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70">
                  <div className="p-5">
                    <ResultTabs
                      result={result}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      search={search}
                      onSearchChange={setSearch}
                      filteredRecords={filteredRecords}
                      isExporting={isExporting}
                      exportError={exportError}
                      onExport={() => {
                        void handleExport();
                      }}
                      onDismissExportError={clearExportError}
                    />
                  </div>
                </Card>

                <div className="flex items-start gap-2 rounded-lg border border-amber-200/70 bg-amber-50/50 px-3 py-2.5 text-[11px] text-amber-900">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <p>
                    Chênh lệch được tính theo công thức{" "}
                    <span className="font-semibold">Δ = Giá trị B − Giá trị A</span>.
                    Dòng lệch được tô màu cam; mã thiếu ở một bên được tô đỏ/xanh để
                    dễ rà soát.
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

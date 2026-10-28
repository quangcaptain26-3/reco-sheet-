"use client";

import { useRef, useState } from "react";
import { Loader2, Lock, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileCard } from "@/components/upload/FileCard";
import { PreviewDataModal } from "@/components/upload/PreviewDataModal";
import { InlineAlert } from "@/components/shared/InlineAlert";
import { cn } from "@/lib/utils";
import type { FileSlotState } from "@/hooks/useFileUpload";

interface DropzoneAreaProps {
  id: string;
  badge: string;
  roleLabel: string;
  accent: "emerald" | "sky";
  state: FileSlotState;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  onDismissError: () => void;
}

const ACCENTS = {
  emerald: {
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    icon: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    border: "hover:border-emerald-300",
    ring: "ring-emerald-400/60",
  },
  sky: {
    badge: "bg-sky-100 text-sky-800 ring-sky-200",
    icon: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
    border: "hover:border-sky-300",
    ring: "ring-sky-400/60",
  },
} as const;

export function DropzoneArea({
  id,
  badge,
  roleLabel,
  accent,
  state,
  onFileSelected,
  onRemove,
  onDismissError,
}: DropzoneAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const palette = ACCENTS[accent];

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <Card
      className={cn(
        "relative gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70 transition",
        isDragging && `ring-2 ${palette.ring}`
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        dragCounter.current += 1;
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5">
        <Badge variant="outline" className={cn("border-0 ring-1", palette.badge)}>
          {badge}
        </Badge>
        <span className="text-[11px] font-medium text-muted-foreground">
          {roleLabel}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".xlsx,.csv"
          className="hidden"
          tabIndex={-1}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {state.sheet ? (
          <>
            <FileCard
              sheet={state.sheet}
              accent={accent}
              onPreview={() => setIsPreviewOpen(true)}
              onRemove={onRemove}
              onReplace={openPicker}
            />
            <span className="sr-only" role="status">
              Đã tải {state.sheet.fileName}, {state.sheet.rowCount} dòng,{" "}
              {state.sheet.columns.length} cột.
            </span>
          </>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={state.isParsing}
            className={cn(
              "group flex min-h-[172px] w-full flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-border bg-background/60 px-4 py-6 text-center transition focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-wait",
              palette.border
            )}
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-full transition",
                palette.icon
              )}
            >
              {state.isParsing ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <UploadCloud className="size-5" aria-hidden />
              )}
            </span>
            <span className="text-sm font-medium">
              {state.isParsing
                ? "Đang đọc dữ liệu trong trình duyệt…"
                : "Kéo thả tệp vào đây hoặc bấm để chọn"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              .xlsx, .csv · tối đa 10MB
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <Lock className="size-3" aria-hidden />
              Không upload lên máy chủ
            </span>
          </button>
        )}

        {state.error ? (
          <InlineAlert variant="error" onDismiss={onDismissError}>
            {state.error}
          </InlineAlert>
        ) : null}

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Đọc sheet đầu tiên. Dòng đầu tiên được dùng làm tên cột.
        </p>
      </div>

      {isDragging ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed bg-background/85 backdrop-blur-[1px]",
            accent === "emerald" ? "border-emerald-400" : "border-sky-400"
          )}
        >
          <div className="flex flex-col items-center gap-2 text-sm font-medium">
            <UploadCloud className="size-6" aria-hidden />
            Thả tệp để {state.sheet ? "thay thế" : "tải lên"}
          </div>
        </div>
      ) : null}

      <PreviewDataModal
        sheet={state.sheet}
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </Card>
  );
}

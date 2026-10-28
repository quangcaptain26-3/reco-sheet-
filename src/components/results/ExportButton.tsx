"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  disabled?: boolean;
}

export function ExportButton({
  onClick,
  isExporting,
  disabled = false,
}: ExportButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      onClick={onClick}
      disabled={isExporting || disabled}
      className="gap-2 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
      title="Tạo báo cáo Excel gồm 1 sheet tổng quan và 4 sheet kết quả"
    >
      {isExporting ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <Download aria-hidden />
      )}
      {isExporting ? "Đang tạo báo cáo…" : "Tải báo cáo Excel"}
    </Button>
  );
}

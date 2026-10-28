import { FileSpreadsheet, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="size-3.5" aria-hidden />
          <span>RecoSheet · Đối soát bảng tính</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden />
          <span>Dữ liệu được xử lý và xoá khỏi RAM khi đóng tab.</span>
        </div>
      </div>
    </footer>
  );
}

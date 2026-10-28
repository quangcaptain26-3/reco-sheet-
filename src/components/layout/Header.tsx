import { FileSpreadsheet, LockKeyhole } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
            <FileSpreadsheet className="size-4" aria-hidden />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-sm font-semibold tracking-tight">
              RecoSheet
            </span>
            <span className="mt-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Đối soát bảng tính
            </span>
          </span>
        </a>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800">
          <LockKeyhole className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Xử lý tại máy</span>
          <span className="sm:hidden">Riêng tư</span>
        </div>
      </div>
    </header>
  );
}

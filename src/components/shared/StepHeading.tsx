import { cn } from "@/lib/utils";

interface StepHeadingProps {
  step: number;
  title: string;
  description: string;
  state?: "idle" | "active" | "done";
  className?: string;
}

export function StepHeading({
  step,
  title,
  description,
  state = "active",
  className,
}: StepHeadingProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1",
          state === "done" &&
            "bg-emerald-600 text-white ring-emerald-600/30",
          state === "active" &&
            "bg-foreground text-background ring-foreground/20",
          state === "idle" &&
            "bg-muted text-muted-foreground ring-border"
        )}
        aria-hidden
      >
        {step}
      </span>
      <div className="min-w-0 space-y-0.5">
        <h2 className="font-heading text-base font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

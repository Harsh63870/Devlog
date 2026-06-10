import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5",
        "border border-edge-strong bg-surface-2/80 font-mono text-[10px] text-text-secondary",
        "shadow-[0_1px_0_oklch(1_0_0/8%)_inset]",
        className,
      )}
      {...props}
    />
  );
}

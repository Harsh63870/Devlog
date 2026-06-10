import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-[linear-gradient(110deg,oklch(1_0_0/4%)_35%,oklch(1_0_0/9%)_50%,oklch(1_0_0/4%)_65%)]",
        "bg-[length:200%_100%] animate-shimmer",
        className,
      )}
      {...props}
    />
  );
}

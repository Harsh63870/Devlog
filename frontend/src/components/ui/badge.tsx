import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide border",
  {
    variants: {
      tone: {
        brand: "bg-brand-500/12 text-brand-300 border-brand-500/25",
        cyan: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/25",
        emerald: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/25",
        amber: "bg-accent-amber/10 text-accent-amber border-accent-amber/25",
        rose: "bg-accent-rose/10 text-accent-rose border-accent-rose/25",
        neutral: "bg-surface-2/80 text-text-secondary border-edge",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

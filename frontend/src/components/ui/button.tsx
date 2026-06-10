import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-all duration-200 outline-none select-none cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-brand-600 text-white border border-brand-500/50",
          "shadow-glow-brand hover:bg-brand-500 hover:shadow-[0_0_32px_oklch(0.65_0.21_295_/_50%)]",
          "active:scale-[0.98]",
        ],
        secondary: [
          "glass text-text-primary",
          "hover:bg-surface-2/80 hover:border-edge-strong active:scale-[0.98]",
        ],
        ghost: [
          "text-text-secondary hover:text-text-primary hover:bg-surface-2/60",
        ],
        outline: [
          "border border-edge-strong text-text-primary bg-transparent",
          "hover:bg-surface-2/60 hover:border-brand-500/40",
        ],
        danger: [
          "bg-accent-rose/15 text-accent-rose border border-accent-rose/30",
          "hover:bg-accent-rose/25",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg [&_svg]:size-3.5",
        md: "h-9.5 px-4 text-sm rounded-xl [&_svg]:size-4",
        lg: "h-11 px-6 text-sm rounded-xl [&_svg]:size-4.5",
        icon: "size-9 rounded-xl [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };

import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "w-full rounded-xl border border-edge bg-surface-1/60 px-3.5 py-2",
    "font-mono text-sm text-text-primary placeholder:text-text-tertiary",
    "transition-all duration-200 outline-none",
    "focus-visible:border-brand-500/50 focus-visible:ring-2 focus-visible:ring-brand-500/30",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      size: {
        sm: "h-8 text-xs rounded-lg px-3",
        md: "h-9.5",
        lg: "h-11",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { inputVariants };

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Switch({ checked, onCheckedChange, disabled, ...props }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10.5 shrink-0 cursor-pointer items-center rounded-full px-0.5",
        "transition-colors duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-500/60",
        "disabled:opacity-45 disabled:pointer-events-none",
        checked ? "bg-brand-600 shadow-glow-brand" : "bg-surface-3 border border-edge",
      )}
      {...props}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "block size-4.5 rounded-full bg-white shadow-md",
          checked ? "ml-auto" : "ml-0",
        )}
      />
    </button>
  );
}

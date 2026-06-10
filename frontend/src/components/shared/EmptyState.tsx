import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl animate-pulse-glow" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-edge-strong bg-surface-2/80">
          <Icon className="size-6 text-brand-300" />
        </div>
      </div>
      <div className="mt-2 text-sm font-medium text-text-primary">{title}</div>
      <p className="max-w-xs text-xs leading-relaxed text-text-tertiary">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { fadeUp, hoverLift } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "brand" | "cyan" | "emerald" | "rose";
  suffix?: string;
}

const toneStyles = {
  brand: "text-brand-300 bg-brand-500/10 border-brand-500/20",
  cyan: "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20",
  emerald: "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20",
  rose: "text-accent-rose bg-accent-rose/10 border-accent-rose/20",
};

export function StatCard({ icon: Icon, label, value, tone = "brand", suffix }: StatCardProps) {
  const animated = useAnimatedCounter(value);

  return (
    <motion.div variants={fadeUp} {...hoverLift}>
      <Card className="p-4">
        <div className="flex items-center gap-3.5">
          <div className={cn("flex size-10 items-center justify-center rounded-xl border", toneStyles[tone])}>
            <Icon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-xl font-semibold tabular-nums tracking-tight">
              {animated.toLocaleString()}
              {suffix && <span className="ml-0.5 text-sm text-text-tertiary">{suffix}</span>}
            </div>
            <div className="truncate text-[11px] uppercase tracking-wider text-text-tertiary">{label}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

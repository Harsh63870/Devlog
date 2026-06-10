import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OutputBlockProps {
  content: string;
  label: string;
  timeTakenSec?: number;
  mono?: boolean;
}

/** Displays a generated AI output with copy action + meta. */
export function OutputBlock({ content, label, timeTakenSec, mono = true }: OutputBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="edge-gradient overflow-hidden rounded-xl bg-surface-1/80"
    >
      <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-brand-300" />
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          {timeTakenSec !== undefined && (
            <Badge tone="cyan" className="font-mono">
              {timeTakenSec}s
            </Badge>
          )}
        </div>
        <CopyButton text={content} label={`${label} copied`} />
      </div>
      <pre
        className={cn(
          "max-h-80 overflow-auto whitespace-pre-wrap break-words px-4 py-3.5 text-[13px] leading-relaxed text-text-primary",
          mono ? "font-mono" : "font-sans",
        )}
      >
        {content}
      </pre>
    </motion.div>
  );
}

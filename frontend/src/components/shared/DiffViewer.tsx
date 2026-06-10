import { memo } from "react";
import { classifyDiffLines, type DiffLineKind } from "@/lib/diff";
import { cn } from "@/lib/utils";

const lineStyles: Record<DiffLineKind, string> = {
  add: "bg-accent-emerald/8 text-accent-emerald border-l-2 border-accent-emerald/50",
  del: "bg-accent-rose/8 text-accent-rose border-l-2 border-accent-rose/50",
  hunk: "bg-accent-cyan/8 text-accent-cyan font-medium",
  meta: "text-text-tertiary",
  context: "text-text-secondary",
};

interface DiffViewerProps {
  raw: string;
  maxHeight?: string;
}

export const DiffViewer = memo(function DiffViewer({ raw, maxHeight = "28rem" }: DiffViewerProps) {
  const lines = classifyDiffLines(raw);

  return (
    <div
      className="overflow-auto rounded-xl border border-edge bg-surface-0/80 font-mono text-[12px] leading-relaxed"
      style={{ maxHeight }}
    >
      <div className="min-w-max py-2">
        {lines.map((line, i) => (
          <div key={i} className={cn("whitespace-pre px-4 py-px", lineStyles[line.kind])}>
            {line.text || " "}
          </div>
        ))}
      </div>
    </div>
  );
});

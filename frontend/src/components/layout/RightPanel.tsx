import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Copy,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  ScanLine,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAppStore, type ActivityKind } from "@/store/useAppStore";
import { useScanDiff, useGenerateCommit, useGeneratePR } from "@/hooks/useGit";
import { useCopy } from "@/hooks/useCopy";
import { Badge } from "@/components/ui/badge";
import { timeAgo, cn } from "@/lib/utils";
import { slideInRight } from "@/lib/motion";

const KIND_META: Record<ActivityKind, { icon: typeof Activity; className: string }> = {
  scan: { icon: ScanLine, className: "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20" },
  commit: { icon: GitCommitHorizontal, className: "text-brand-300 bg-brand-500/10 border-brand-500/20" },
  pr: { icon: GitPullRequest, className: "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20" },
  copy: { icon: Copy, className: "text-accent-amber bg-accent-amber/10 border-accent-amber/20" },
  system: { icon: Zap, className: "text-text-tertiary bg-surface-2 border-edge" },
};

function QuickAction({
  icon: Icon,
  label,
  onClick,
  loading,
}: {
  icon: typeof Activity;
  label: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-edge bg-surface-1/60 px-3 py-2.5",
        "text-xs text-text-secondary transition-all duration-150",
        "hover:border-brand-500/30 hover:bg-surface-2/70 hover:text-text-primary",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <Icon className={cn("size-3.5 text-text-tertiary transition-colors group-hover:text-brand-300", loading && "animate-pulse text-brand-300")} />
      {loading ? <span className="shimmer-text">Working…</span> : label}
    </button>
  );
}

export function RightPanel() {
  const activity = useAppStore((s) => s.activity);
  const outputs = useAppStore((s) => s.outputs);
  const setView = useAppStore((s) => s.setView);

  const scan = useScanDiff();
  const commit = useGenerateCommit();
  const pr = useGeneratePR();
  const { copy } = useCopy("Output copied");

  return (
    <aside className="glass-strong z-10 flex h-full w-72 shrink-0 flex-col gap-0 overflow-hidden border-y-0 border-r-0 max-xl:hidden">
      {/* Quick actions */}
      <div className="border-b border-edge p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
          <Zap className="size-3" /> Quick Actions
        </div>
        <div className="flex flex-col gap-2">
          <QuickAction icon={ScanLine} label="Scan staged diff" onClick={() => { setView("analysis"); scan.mutate(); }} loading={scan.isPending} />
          <QuickAction icon={GitCommitHorizontal} label="Generate commit" onClick={() => { setView("commit"); commit.mutate(); }} loading={commit.isPending} />
          <QuickAction icon={GitPullRequest} label="Generate PR" onClick={() => { setView("pr"); pr.mutate(); }} loading={pr.isPending} />
        </div>
      </div>

      {/* Latest outputs */}
      <div className="border-b border-edge p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
          <Sparkles className="size-3" /> Outputs
        </div>
        {outputs.length === 0 ? (
          <p className="text-xs leading-relaxed text-text-tertiary">
            Generated commits and PRs will appear here.
          </p>
        ) : (
          <div className="flex max-h-44 flex-col gap-2 overflow-y-auto">
            <AnimatePresence initial={false}>
              {outputs.slice(0, 4).map((output) => (
                <motion.button
                  key={output.id}
                  variants={slideInRight}
                  initial="initial"
                  animate="enter"
                  exit={{ opacity: 0, x: 16 }}
                  onClick={() => copy(output.content)}
                  title="Click to copy"
                  className="group cursor-pointer rounded-lg border border-edge bg-surface-1/70 p-2.5 text-left transition-colors hover:border-brand-500/30"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Badge tone={output.kind === "commit" ? "brand" : "emerald"}>
                      {output.kind === "commit" ? "commit" : "pull request"}
                    </Badge>
                    <Copy className="size-3 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="line-clamp-2 font-mono text-[11px] leading-snug text-text-secondary">
                    {output.content}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Activity feed */}
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
          <Activity className="size-3" /> Activity
        </div>
        <div className="no-scrollbar -mr-1 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {activity.map((item) => {
              const meta = KIND_META[item.kind];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="flex items-center gap-2.5 py-1.5"
                >
                  <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md border", meta.className)}>
                    <meta.icon className="size-3" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{item.label}</span>
                  <span className="shrink-0 font-mono text-[10px] text-text-tertiary">{timeAgo(item.timestamp)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {activity.length === 1 && (
            <div className="flex items-center gap-2 py-2 text-[11px] text-text-tertiary">
              <GitBranch className="size-3" /> Actions you take will show up here.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

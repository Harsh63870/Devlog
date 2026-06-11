import { useState } from "react";
import { motion } from "framer-motion";
import { Check, GitCommitHorizontal, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { OutputBlock } from "@/components/shared/OutputBlock";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useCommitChanges, useGenerateCommit } from "@/hooks/useGit";
import { useAppStore } from "@/store/useAppStore";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function CommitView() {
  const commit = useGenerateCommit();
  const commitChanges = useCommitChanges();
  const outputs = useAppStore((s) => s.outputs);
  const commitOutputs = outputs.filter((o) => o.kind === "commit");
  const latest = commitOutputs[0];

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastCommitHash, setLastCommitHash] = useState<string | null>(null);

  const handleCommit = () => {
    if (!latest) return;
    commitChanges.mutate(latest.content, {
      onSuccess: (data) => {
        if (data.success && data.commit_hash) {
          setLastCommitHash(data.commit_hash);
        }
        setConfirmOpen(false);
      },
      onError: () => setConfirmOpen(false),
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="mx-auto flex max-w-4xl flex-col gap-6 p-8 max-md:p-5"
    >
      <SectionHeader
        title="Commit Generator"
        description="AI-written conventional commit messages from your staged diff. Generation is local; publishing commits for real."
        actions={
          <Button variant="primary" onClick={() => commit.mutate()} disabled={commit.isPending}>
            {commit.isPending ? (
              <>
                <RefreshCw className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Wand2 /> Generate commit
              </>
            )}
          </Button>
        }
      />

      {commit.isPending && (
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="size-4 animate-pulse text-brand-300" />
              <span className="shimmer-text text-sm">Reading your diff and writing a commit message…</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        </motion.div>
      )}

      {!commit.isPending && !latest && (
        <motion.div variants={fadeUp}>
          <Card>
            <EmptyState
              icon={GitCommitHorizontal}
              title="No commit generated yet"
              description="Stage your changes, then let the local model write a conventional commit message for you."
              action={
                <Button variant="primary" size="sm" onClick={() => commit.mutate()}>
                  <Wand2 /> Generate now
                </Button>
              }
            />
          </Card>
        </motion.div>
      )}

      {!commit.isPending && latest && (
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <OutputBlock content={latest.content} label="Commit message" timeTakenSec={latest.timeTakenSec} />

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => setConfirmOpen(true)}>
              <GitCommitHorizontal /> Commit staged changes
            </Button>
            <span className="text-xs text-text-tertiary">
              Runs <code className="font-mono text-accent-cyan">git commit</code> on your configured repo
            </span>
          </div>

          {lastCommitHash && (
            <div className="flex items-center gap-2 rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-3">
              <Check className="size-4 text-accent-emerald" />
              <span className="text-sm text-text-secondary">
                Committed as <code className="font-mono text-accent-emerald">{lastCommitHash.slice(0, 7)}</code>
              </span>
            </div>
          )}

          <div className="rounded-xl border border-edge bg-surface-1/50 p-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
              Manual fallback
            </div>
            <code className="block overflow-x-auto whitespace-nowrap rounded-lg bg-surface-0/80 px-3.5 py-2.5 font-mono text-xs text-accent-cyan">
              git commit -m "{latest.content.replaceAll('"', '\\"')}"
            </code>
          </div>
        </motion.div>
      )}

      {commitOutputs.length > 1 && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                History <Badge tone="neutral">{commitOutputs.length - 1}</Badge>
              </div>
              {commitOutputs.slice(1, 6).map((output) => (
                <div
                  key={output.id}
                  className="truncate rounded-lg border border-edge bg-surface-0/60 px-3 py-2 font-mono text-xs text-text-tertiary"
                >
                  {output.content}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Commit staged changes?"
        description={`This will run git commit with message: "${latest?.content ?? ""}". This action cannot be undone easily.`}
        confirmLabel="Commit"
        loading={commitChanges.isPending}
        onConfirm={handleCommit}
        onCancel={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
}

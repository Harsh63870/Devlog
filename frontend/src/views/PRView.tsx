import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, GitPullRequest, RefreshCw, Sparkles, Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useCreatePR, useGeneratePR, usePushBranch } from "@/hooks/useGit";
import { useAppStore } from "@/store/useAppStore";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function PRView() {
  const pr = useGeneratePR();
  const push = usePushBranch();
  const createPR = useCreatePR();
  const outputs = useAppStore((s) => s.outputs);
  const prOutputs = outputs.filter((o) => o.kind === "pr");
  const latest = prOutputs[0];
  const latestCommit = outputs.find((o) => o.kind === "commit");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishStep, setPublishStep] = useState<"idle" | "pushing" | "creating">("idle");
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedNumber, setPublishedNumber] = useState<number | null>(null);

  useEffect(() => {
    if (latest) {
      setDescription(latest.content);
    }
  }, [latest?.id, latest?.content]);

  useEffect(() => {
    if (!title && latestCommit?.content) {
      setTitle(latestCommit.content);
    } else if (!title && latest?.content) {
      const firstLine = latest.content.split("\n").find((l) => l.trim()) ?? "";
      setTitle(firstLine.replace(/^#+\s*/, "").slice(0, 80));
    }
  }, [latestCommit?.content, latest?.content, title]);

  const isPublishing = publishStep !== "idle";

  const handlePublish = async () => {
    setPublishStep("pushing");
    try {
      const pushResult = await push.mutateAsync(undefined);
      if (!pushResult.success) {
        setPublishStep("idle");
        setConfirmOpen(false);
        return;
      }

      setPublishStep("creating");
      const prResult = await createPR.mutateAsync({
        title: title.trim(),
        body: description.trim(),
      });

      if (prResult.success && prResult.pr_url) {
        setPublishedUrl(prResult.pr_url);
        setPublishedNumber(prResult.pr_number ?? null);
      }
    } finally {
      setPublishStep("idle");
      setConfirmOpen(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="mx-auto flex max-w-4xl flex-col gap-6 p-8 max-md:p-5"
    >
      <SectionHeader
        title="PR Generator"
        description="Generate a description locally, then push your branch and open a real pull request on GitHub."
        actions={
          <Button variant="primary" onClick={() => pr.mutate()} disabled={pr.isPending}>
            {pr.isPending ? (
              <>
                <RefreshCw className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Wand2 /> Generate PR
              </>
            )}
          </Button>
        }
      />

      {pr.isPending && (
        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="size-4 animate-pulse text-accent-emerald" />
              <span className="shimmer-text text-sm">Analyzing changes and drafting your PR description…</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </motion.div>
      )}

      {!pr.isPending && !latest && (
        <motion.div variants={fadeUp}>
          <Card>
            <EmptyState
              icon={GitPullRequest}
              title="No PR description yet"
              description="Generate a complete, professional PR description from your staged changes in one click."
              action={
                <Button variant="primary" size="sm" onClick={() => pr.mutate()}>
                  <Wand2 /> Generate now
                </Button>
              }
            />
          </Card>
        </motion.div>
      )}

      {!pr.isPending && latest && (
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
              PR title
            </label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="feat: add something" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
              PR description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={14}
              className="w-full resize-y rounded-xl border border-edge bg-surface-1/60 px-3.5 py-3 font-mono text-sm leading-relaxed text-text-primary outline-none transition-all focus-visible:border-brand-500/50 focus-visible:ring-2 focus-visible:ring-brand-500/30"
            />
            {latest.timeTakenSec !== undefined && (
              <Badge tone="neutral" className="w-fit font-mono text-[10px]">
                generated in {latest.timeTakenSec}s
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setConfirmOpen(true)}
              disabled={isPublishing || !title.trim() || !description.trim()}
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="animate-spin" />
                  {publishStep === "pushing" ? "Pushing…" : "Opening PR…"}
                </>
              ) : (
                <>
                  <Upload /> Push & Open PR on GitHub
                </>
              )}
            </Button>
            <span className="text-xs text-text-tertiary">
              Pushes to origin, then calls GitHub API
            </span>
          </div>

          {publishedUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-3">
              <GitPullRequest className="size-4 text-accent-emerald" />
              <span className="flex-1 text-sm text-text-secondary">
                Pull request {publishedNumber ? `#${publishedNumber}` : ""} created
              </span>
              <Button variant="outline" size="sm" onClick={() => window.open(publishedUrl, "_blank")}>
                <ExternalLink /> Open on GitHub
              </Button>
            </div>
          )}
        </motion.div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Push branch and open PR?"
        description={`This will push your current branch to origin and create a pull request titled "${title}". Requires a configured GitHub token.`}
        confirmLabel="Push & Open PR"
        loading={isPublishing}
        onConfirm={handlePublish}
        onCancel={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
}

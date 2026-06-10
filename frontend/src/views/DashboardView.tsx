import { motion } from "framer-motion";
import {
  ArrowRight,
  FileDiff,
  GitCommitHorizontal,
  GitPullRequest,
  Minus,
  Plus,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { useGitDiff, useScanDiff, useGenerateCommit, useGeneratePR } from "@/hooks/useGit";
import { useAppStore } from "@/store/useAppStore";
import { fadeUp, staggerContainer, hoverLift } from "@/lib/motion";

export function DashboardView() {
  const setView = useAppStore((s) => s.setView);
  const outputs = useAppStore((s) => s.outputs);
  const { data: stats } = useGitDiff();
  const scan = useScanDiff();
  const commit = useGenerateCommit();
  const pr = useGeneratePR();

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="mx-auto flex max-w-5xl flex-col gap-6 p-8 max-md:p-5"
    >
      {/* Hero */}
      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-xl2">
        <Card glow className="relative overflow-hidden p-8 max-md:p-6">
          <div className="absolute -right-20 -top-24 size-64 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="absolute -bottom-28 -left-12 size-64 rounded-full bg-accent-cyan/10 blur-3xl" />
          <div className="relative">
            <Badge tone="brand" className="mb-4">
              <Sparkles className="size-3" /> Local AI · Ollama powered
            </Badge>
            <h1 className="max-w-xl text-balance text-3xl font-semibold leading-tight tracking-tight max-md:text-2xl">
              Ship better commits, <span className="text-gradient">written by AI.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-secondary">
              DevLog reads your staged changes and writes conventional commit messages and
              pull-request descriptions — entirely on your machine.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setView("analysis");
                  scan.mutate();
                }}
              >
                <ScanLine /> Scan staged changes
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setView("commit")}>
                Generate commit <ArrowRight />
              </Button>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Repository status */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-tertiary">
          Repository status
        </h2>
        <Badge tone={stats && stats.files.length > 0 ? "emerald" : "neutral"}>
          {stats
            ? stats.files.length > 0
              ? "Staged changes detected"
              : "Working tree clean"
            : "Not scanned yet"}
        </Badge>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        <StatCard icon={FileDiff} label="Files changed" value={stats?.files.length ?? 0} tone="brand" />
        <StatCard icon={Plus} label="Insertions" value={stats?.additions ?? 0} tone="emerald" />
        <StatCard icon={Minus} label="Deletions" value={stats?.deletions ?? 0} tone="rose" />
        <StatCard icon={Sparkles} label="AI outputs" value={outputs.length} tone="cyan" />
      </div>

      {/* Workflow panels */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <motion.div variants={fadeUp} {...hoverLift}>
          <Card className="group h-full cursor-pointer transition-colors hover:border-brand-500/30" onClick={() => setView("commit")}>
            <CardContent className="flex h-full flex-col gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10">
                <GitCommitHorizontal className="size-4.5 text-brand-300" />
              </div>
              <div className="text-sm font-semibold">Commit Generator</div>
              <p className="flex-1 text-xs leading-relaxed text-text-tertiary">
                Conventional-commits formatted messages, generated from your staged diff in seconds.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 text-brand-300"
                disabled={commit.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  setView("commit");
                  commit.mutate();
                }}
              >
                {commit.isPending ? "Generating…" : "Generate now"} <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} {...hoverLift}>
          <Card className="group h-full cursor-pointer transition-colors hover:border-accent-emerald/30" onClick={() => setView("pr")}>
            <CardContent className="flex h-full flex-col gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-accent-emerald/20 bg-accent-emerald/10">
                <GitPullRequest className="size-4.5 text-accent-emerald" />
              </div>
              <div className="text-sm font-semibold">PR Generator</div>
              <p className="flex-1 text-xs leading-relaxed text-text-tertiary">
                Structured pull-request descriptions with summary, change list, and stats.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 text-accent-emerald"
                disabled={pr.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  setView("pr");
                  pr.mutate();
                }}
              >
                {pr.isPending ? "Generating…" : "Generate now"} <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

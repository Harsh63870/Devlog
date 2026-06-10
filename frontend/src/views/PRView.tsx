import { motion } from "framer-motion";
import { GitPullRequest, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { OutputBlock } from "@/components/shared/OutputBlock";
import { useGeneratePR } from "@/hooks/useGit";
import { useAppStore } from "@/store/useAppStore";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function PRView() {
  const pr = useGeneratePR();
  const outputs = useAppStore((s) => s.outputs);
  const latest = outputs.find((o) => o.kind === "pr");

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="mx-auto flex max-w-4xl flex-col gap-6 p-8 max-md:p-5"
    >
      <SectionHeader
        title="PR Generator"
        description="Structured pull-request descriptions with summary, changes, and stats — ready to paste into GitHub."
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
        <motion.div variants={fadeUp}>
          <OutputBlock content={latest.content} label="PR description" timeTakenSec={latest.timeTakenSec} mono={false} />
        </motion.div>
      )}
    </motion.div>
  );
}

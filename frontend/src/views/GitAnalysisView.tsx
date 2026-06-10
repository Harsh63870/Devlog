import { motion } from "framer-motion";
import { FileDiff, FilePlus2, FileX2, GitBranch, Minus, Plus, RefreshCw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { DiffViewer } from "@/components/shared/DiffViewer";
import { StatCard } from "@/components/shared/StatCard";
import { useGitDiff, useScanDiff } from "@/hooks/useGit";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DiffFile } from "@/lib/diff";

const FILE_STATUS_META: Record<DiffFile["status"], { icon: typeof FileDiff; tone: string }> = {
  modified: { icon: FileDiff, tone: "text-accent-amber" },
  added: { icon: FilePlus2, tone: "text-accent-emerald" },
  deleted: { icon: FileX2, tone: "text-accent-rose" },
};

export function GitAnalysisView() {
  const { data: stats } = useGitDiff();
  const scan = useScanDiff();
  const hasData = !!stats && stats.raw.trim().length > 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="mx-auto flex max-w-5xl flex-col gap-6 p-8 max-md:p-5"
    >
      <SectionHeader
        title="Git Analysis"
        description="Inspect your staged diff before generating commits and PRs."
        actions={
          <Button variant="primary" onClick={() => scan.mutate()} disabled={scan.isPending}>
            {scan.isPending ? (
              <>
                <RefreshCw className="animate-spin" /> Scanning…
              </>
            ) : (
              <>
                <ScanLine /> {hasData ? "Re-scan" : "Scan staged diff"}
              </>
            )}
          </Button>
        }
      />

      {scan.isPending && (
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <Skeleton className="h-[74px]" />
            <Skeleton className="h-[74px]" />
            <Skeleton className="h-[74px]" />
          </div>
          <Skeleton className="h-72" />
        </motion.div>
      )}

      {!scan.isPending && !hasData && (
        <motion.div variants={fadeUp}>
          <Card>
            <EmptyState
              icon={GitBranch}
              title="No diff scanned yet"
              description="Stage your changes with `git add`, then scan to see a full breakdown of your working diff."
              action={
                <Button variant="primary" size="sm" onClick={() => scan.mutate()}>
                  <ScanLine /> Scan now
                </Button>
              }
            />
          </Card>
        </motion.div>
      )}

      {!scan.isPending && hasData && stats && (
        <>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <StatCard icon={FileDiff} label="Files changed" value={stats.files.length} tone="brand" />
            <StatCard icon={Plus} label="Insertions" value={stats.additions} tone="emerald" />
            <StatCard icon={Minus} label="Deletions" value={stats.deletions} tone="rose" />
          </div>

          <div className="grid grid-cols-[280px_1fr] gap-4 max-lg:grid-cols-1">
            {/* Changed files list */}
            <motion.div variants={fadeUp}>
              <Card className="h-full">
                <CardHeader>
                  <div>
                    <CardTitle>Changed files</CardTitle>
                    <CardDescription className="mt-1">{stats.files.length} staged</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 pt-3">
                  {stats.files.map((file, i) => {
                    const meta = FILE_STATUS_META[file.status];
                    return (
                      <motion.div
                        key={file.path}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2/60"
                      >
                        <meta.icon className={cn("size-3.5 shrink-0", meta.tone)} />
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary" title={file.path}>
                          {file.path}
                        </span>
                        <span className="shrink-0 font-mono text-[10px]">
                          <span className="text-accent-emerald">+{file.additions}</span>{" "}
                          <span className="text-accent-rose">−{file.deletions}</span>
                        </span>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Raw diff */}
            <motion.div variants={fadeUp}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Diff preview</CardTitle>
                  <Badge tone="cyan" className="font-mono">
                    git diff --cached
                  </Badge>
                </CardHeader>
                <CardContent className="pt-3">
                  <DiffViewer raw={stats.raw} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}

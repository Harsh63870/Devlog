import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { parseDiff } from "@/lib/diff";
import { useAppStore } from "@/store/useAppStore";

export function useGitDiff() {
  return useQuery({
    queryKey: ["git-diff"],
    queryFn: api.getDiff,
    select: (data) => parseDiff(data.diff ?? ""),
    enabled: false,
    retry: 1,
  });
}

export function useScanDiff() {
  const queryClient = useQueryClient();
  const logActivity = useAppStore((s) => s.logActivity);

  return useMutation({
    mutationFn: api.getDiff,
    onSuccess: (data) => {
      queryClient.setQueryData(["git-diff"], data);
      const stats = parseDiff(data.diff ?? "");
      logActivity(
        "scan",
        stats.files.length > 0
          ? `Scanned diff — ${stats.files.length} file${stats.files.length === 1 ? "" : "s"} changed`
          : "Scanned diff — no staged changes",
      );
      if (stats.files.length === 0) {
        toast.info("No staged changes", {
          description: "Run `git add` to stage changes first.",
        });
      }
    },
    onError: (err: Error) => {
      toast.error("Failed to scan diff", { description: err.message });
    },
  });
}

export function useGenerateCommit() {
  const logActivity = useAppStore((s) => s.logActivity);
  const addOutput = useAppStore((s) => s.addOutput);

  return useMutation({
    mutationFn: api.generateCommit,
    onSuccess: (data) => {
      logActivity("commit", "Generated commit message");
      addOutput({ kind: "commit", content: data.message, timeTakenSec: data.time_taken_sec });
      toast.success("Commit message ready", {
        description: data.time_taken_sec ? `Generated in ${data.time_taken_sec}s` : undefined,
      });
    },
    onError: (err: Error) => {
      toast.error("Commit generation failed", { description: err.message });
    },
  });
}

export function useGeneratePR() {
  const logActivity = useAppStore((s) => s.logActivity);
  const addOutput = useAppStore((s) => s.addOutput);

  return useMutation({
    mutationFn: api.generatePR,
    onSuccess: (data) => {
      logActivity("pr", "Generated PR description");
      addOutput({ kind: "pr", content: data.description, timeTakenSec: data.time_taken_sec });
      toast.success("PR description ready", {
        description: data.time_taken_sec ? `Generated in ${data.time_taken_sec}s` : undefined,
      });
    },
    onError: (err: Error) => {
      toast.error("PR generation failed", { description: err.message });
    },
  });
}

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

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: api.getSettings,
    staleTime: 30_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const logActivity = useAppStore((s) => s.logActivity);

  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["repo-status"] });
      logActivity("system", "Updated settings");
      toast.success("Settings saved");
    },
    onError: (err: Error) => {
      toast.error("Failed to save settings", { description: err.message });
    },
  });
}

export function useRepoStatus() {
  return useQuery({
    queryKey: ["repo-status"],
    queryFn: api.getRepoStatus,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useCommitChanges() {
  const queryClient = useQueryClient();
  const logActivity = useAppStore((s) => s.logActivity);

  return useMutation({
    mutationFn: (message: string) => api.commitChanges(message),
    onSuccess: (data) => {
      if (data.success && data.commit_hash) {
        logActivity("git", `Committed — ${data.commit_hash.slice(0, 7)}`);
        queryClient.invalidateQueries({ queryKey: ["repo-status"] });
        queryClient.invalidateQueries({ queryKey: ["git-diff"] });
        toast.success("Changes committed", { description: data.commit_hash.slice(0, 7) });
      } else {
        toast.error("Commit failed", { description: data.error ?? "Unknown error" });
      }
    },
    onError: (err: Error) => {
      toast.error("Commit failed", { description: err.message });
    },
  });
}

export function usePushBranch() {
  const queryClient = useQueryClient();
  const logActivity = useAppStore((s) => s.logActivity);

  return useMutation({
    mutationFn: (branch?: string) => api.pushBranch(branch),
    onSuccess: (data) => {
      if (data.success) {
        logActivity("git", "Pushed branch to origin");
        queryClient.invalidateQueries({ queryKey: ["repo-status"] });
        toast.success("Branch pushed", { description: data.output });
      } else {
        toast.error("Push failed", { description: data.error ?? "Unknown error" });
      }
    },
    onError: (err: Error) => {
      toast.error("Push failed", { description: err.message });
    },
  });
}

export function useCreatePR() {
  const logActivity = useAppStore((s) => s.logActivity);
  const addOutput = useAppStore((s) => s.addOutput);

  return useMutation({
    mutationFn: api.createPR,
    onSuccess: (data, variables) => {
      if (data.success && data.pr_url) {
        logActivity("publish", `Opened PR #${data.pr_number}`);
        addOutput({
          kind: "pr",
          content: variables.body,
          prUrl: data.pr_url,
          prNumber: data.pr_number,
        });
        toast.success("Pull request created", {
          description: `PR #${data.pr_number}`,
        });
      } else {
        toast.error("PR creation failed", { description: data.error ?? "Unknown error" });
      }
    },
    onError: (err: Error) => {
      toast.error("PR creation failed", { description: err.message });
    },
  });
}

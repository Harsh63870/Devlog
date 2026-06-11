import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Cpu, Eye, EyeOff, FolderGit2, Gauge, GitBranch, KeyRound, RefreshCw, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import { useRepoStatus, useSettings, useUpdateSettings } from "@/hooks/useGit";
import { fadeUp, staggerContainer } from "@/lib/motion";

function SettingRow({
  icon: Icon,
  title,
  description,
  control,
}: {
  icon: typeof Cpu;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-edge bg-surface-2/70">
          <Icon className="size-4 text-text-secondary" />
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <p className="mt-0.5 max-w-md text-xs leading-relaxed text-text-tertiary">{description}</p>
        </div>
      </div>
      <div className="shrink-0 min-w-0 flex-1 max-w-xs">{control}</div>
    </div>
  );
}

export function SettingsView() {
  const show3D = useAppStore((s) => s.show3D);
  const setShow3D = useAppStore((s) => s.setShow3D);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const repoStatus = useRepoStatus();

  const [repoPath, setRepoPath] = useState(".");
  const [githubToken, setGithubToken] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");
  const [revealToken, setRevealToken] = useState(false);
  const [testRequested, setTestRequested] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setRepoPath(settings.data.repo_path);
      setBaseBranch(settings.data.default_base_branch);
    }
  }, [settings.data]);

  const handleSave = () => {
    const payload: { repo_path: string; default_base_branch: string; github_token?: string } = {
      repo_path: repoPath,
      default_base_branch: baseBranch,
    };
    if (githubToken.trim()) {
      payload.github_token = githubToken.trim();
    }
    updateSettings.mutate(payload);
    setGithubToken("");
  };

  const handleTestConnection = () => {
    setTestRequested(true);
    repoStatus.refetch();
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="mx-auto flex max-w-3xl flex-col gap-6 p-8 max-md:p-5"
    >
      <SectionHeader
        title="Settings"
        description="Tune appearance, configure your repository, and connect GitHub for publishing."
      />

      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="divide-y divide-edge">
            <SettingRow
              icon={Box}
              title="3D background"
              description="Animated commit graph and particle field. Disable on low-power devices for maximum battery life."
              control={<Switch checked={show3D} onCheckedChange={setShow3D} aria-label="Toggle 3D background" />}
            />
            <SettingRow
              icon={Gauge}
              title="Reduced motion"
              description="Minimizes page transitions and decorative animation throughout the app."
              control={<Switch checked={reducedMotion} onCheckedChange={setReducedMotion} aria-label="Toggle reduced motion" />}
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="divide-y divide-edge">
            <SettingRow
              icon={FolderGit2}
              title="Repository path"
              description="Local path to your git repo. AI generation reads staged diffs here; commit/push also run against this path."
              control={<Input value={repoPath} onChange={(e) => setRepoPath(e.target.value)} placeholder="." />}
            />
            <SettingRow
              icon={KeyRound}
              title="GitHub token"
              description="Personal access token for push and PR creation. Stored locally in devlog.local.json — never sent to Ollama."
              control={
                <div className="flex items-center gap-2">
                  <Input
                    type={revealToken ? "text" : "password"}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder={settings.data?.github_token || "ghp_…"}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRevealToken(!revealToken)}
                    aria-label={revealToken ? "Hide token" : "Reveal token"}
                  >
                    {revealToken ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              }
            />
            <SettingRow
              icon={GitBranch}
              title="Default base branch"
              description="Target branch when opening pull requests on GitHub."
              control={<Input value={baseBranch} onChange={(e) => setBaseBranch(e.target.value)} placeholder="main" />}
            />
            <div className="flex items-center justify-end gap-2 py-4">
              <Button variant="outline" onClick={handleTestConnection} disabled={repoStatus.isFetching}>
                {repoStatus.isFetching ? (
                  <>
                    <RefreshCw className="animate-spin" /> Testing…
                  </>
                ) : (
                  "Test connection"
                )}
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving…" : "Save settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {testRequested && repoStatus.data && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="flex flex-col gap-3 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                Connection test
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand" className="font-mono">{repoStatus.data.owner}/{repoStatus.data.repo}</Badge>
                <Badge tone="cyan" className="font-mono">{repoStatus.data.branch}</Badge>
                <Badge tone="neutral" className="font-mono">base: {repoStatus.data.default_branch}</Badge>
                {repoStatus.data.ahead > 0 && (
                  <Badge tone="emerald" className="font-mono">↑{repoStatus.data.ahead}</Badge>
                )}
                {repoStatus.data.behind > 0 && (
                  <Badge tone="amber" className="font-mono">↓{repoStatus.data.behind}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {testRequested && repoStatus.isError && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="py-4 text-sm text-accent-rose">
              {(repoStatus.error as Error).message}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="divide-y divide-edge">
            <SettingRow
              icon={Cpu}
              title="AI model (local)"
              description="Commit and PR text generation runs entirely on your machine via Ollama — no network calls."
              control={<Badge tone="brand" className="font-mono">mistral</Badge>}
            />
            <SettingRow
              icon={Server}
              title="Publishing (GitHub)"
              description="Commit, push, and open PR actions talk to git locally and the GitHub REST API. Only these steps leave your machine."
              control={<Badge tone="emerald" className="font-mono">GitHub API</Badge>}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

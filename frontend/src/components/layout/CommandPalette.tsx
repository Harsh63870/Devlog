import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command } from "cmdk";
import {
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  LayoutDashboard,
  ScanLine,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAppStore, type ViewId } from "@/store/useAppStore";
import { useScanDiff, useGenerateCommit, useGeneratePR } from "@/hooks/useGit";
import { Kbd } from "@/components/ui/kbd";

export function CommandPalette() {
  const open = useAppStore((s) => s.commandOpen);
  const setOpen = useAppStore((s) => s.setCommandOpen);
  const setView = useAppStore((s) => s.setView);

  const scan = useScanDiff();
  const commit = useGenerateCommit();
  const pr = useGeneratePR();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (!open && (e.metaKey || e.ctrlKey) && /^[1-5]$/.test(e.key)) {
        const views: ViewId[] = ["dashboard", "analysis", "commit", "pr", "settings"];
        e.preventDefault();
        setView(views[Number(e.key) - 1]);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen, setView]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const navigate = (view: ViewId) => run(() => setView(view));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-surface-0/60 px-4 pt-[18vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Command palette"
              className="glass-strong edge-gradient overflow-hidden rounded-xl2 shadow-card"
            >
              <div className="flex items-center gap-3 border-b border-edge px-4">
                <Sparkles className="size-4 text-brand-300" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search…"
                  className="h-13 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
                />
                <Kbd>ESC</Kbd>
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-text-tertiary">
                <Command.Empty className="py-8 text-center text-sm text-text-tertiary">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Actions">
                  <PaletteItem icon={ScanLine} label="Scan staged diff" shortcut="S" onSelect={() => run(() => { setView("analysis"); scan.mutate(); })} />
                  <PaletteItem icon={GitCommitHorizontal} label="Generate commit message" shortcut="C" onSelect={() => run(() => { setView("commit"); commit.mutate(); })} />
                  <PaletteItem icon={GitPullRequest} label="Generate PR description" shortcut="P" onSelect={() => run(() => { setView("pr"); pr.mutate(); })} />
                </Command.Group>

                <Command.Group heading="Navigate">
                  <PaletteItem icon={LayoutDashboard} label="Dashboard" shortcut="⌘1" onSelect={() => navigate("dashboard")} />
                  <PaletteItem icon={GitBranch} label="Git Analysis" shortcut="⌘2" onSelect={() => navigate("analysis")} />
                  <PaletteItem icon={GitCommitHorizontal} label="Commit Generator" shortcut="⌘3" onSelect={() => navigate("commit")} />
                  <PaletteItem icon={GitPullRequest} label="PR Generator" shortcut="⌘4" onSelect={() => navigate("pr")} />
                  <PaletteItem icon={Settings} label="Settings" shortcut="⌘5" onSelect={() => navigate("settings")} />
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaletteItem({
  icon: Icon,
  label,
  shortcut,
  onSelect,
}: {
  icon: typeof Sparkles;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-text-secondary transition-colors data-[selected=true]:bg-brand-500/12 data-[selected=true]:text-text-primary"
    >
      <Icon className="size-4 text-text-tertiary" />
      <span className="flex-1">{label}</span>
      {shortcut && <Kbd>{shortcut}</Kbd>}
    </Command.Item>
  );
}

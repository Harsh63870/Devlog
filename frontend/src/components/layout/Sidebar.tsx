import { motion } from "framer-motion";
import {
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  LayoutDashboard,
  Settings,
  Terminal,
} from "lucide-react";
import { useAppStore, type ViewId } from "@/store/useAppStore";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof LayoutDashboard; shortcut: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "1" },
  { id: "analysis", label: "Git Analysis", icon: GitBranch, shortcut: "2" },
  { id: "commit", label: "Commit Generator", icon: GitCommitHorizontal, shortcut: "3" },
  { id: "pr", label: "PR Generator", icon: GitPullRequest, shortcut: "4" },
  { id: "settings", label: "Settings", icon: Settings, shortcut: "5" },
];

export function Sidebar() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <aside className="glass-strong relative z-20 flex h-full w-60 shrink-0 flex-col border-y-0 border-l-0 max-lg:w-16">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-edge px-5 max-lg:justify-center max-lg:px-0">
        <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 shadow-glow-brand">
          <Terminal className="size-4 text-white" />
        </div>
        <div className="max-lg:hidden">
          <div className="text-sm font-semibold tracking-tight">DevLog</div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
            Git Copilot
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3 max-lg:items-center max-lg:px-2">
        {NAV_ITEMS.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 cursor-pointer max-lg:justify-center max-lg:px-0",
                active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl border border-brand-500/25 bg-brand-500/10"
                />
              )}
              <item.icon
                className={cn(
                  "relative size-4 shrink-0 transition-colors",
                  active ? "text-brand-300" : "group-hover:text-text-secondary",
                )}
              />
              <span className="relative flex-1 text-left max-lg:hidden">{item.label}</span>
              <Kbd className="relative opacity-0 transition-opacity group-hover:opacity-100 max-lg:hidden">
                {item.shortcut}
              </Kbd>
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="border-t border-edge p-4 max-lg:px-2">
        <div className="flex items-center gap-2.5 max-lg:justify-center">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-emerald opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent-emerald" />
          </span>
          <div className="text-[11px] text-text-tertiary max-lg:hidden">
            <span className="font-mono text-accent-emerald">mistral</span> · localhost:8000
          </div>
        </div>
      </div>
    </aside>
  );
}

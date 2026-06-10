import { Search, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  analysis: "Git Analysis",
  commit: "Commit Generator",
  pr: "PR Generator",
  settings: "Settings",
};

export function Topbar() {
  const view = useAppStore((s) => s.view);
  const setCommandOpen = useAppStore((s) => s.setCommandOpen);

  return (
    <header className="glass-strong relative z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-x-0 border-t-0 px-6">
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-tertiary">DevLog</span>
        <span className="text-text-tertiary/50">/</span>
        <span className="text-sm font-medium">{VIEW_TITLES[view]}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandOpen(true)}
          className="group flex h-9 w-56 cursor-pointer items-center gap-2.5 rounded-xl border border-edge bg-surface-1/60 px-3 text-xs text-text-tertiary transition-colors hover:border-edge-strong hover:bg-surface-2/60 max-md:w-9 max-md:justify-center max-md:px-0"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left max-md:hidden">Search commands…</span>
          <span className="flex items-center gap-0.5 max-md:hidden">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <Badge tone="brand" className="max-md:hidden">
          <Sparkles className="size-3" />
          AI Ready
        </Badge>
      </div>
    </header>
  );
}

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardView } from "@/views/DashboardView";
import { GitAnalysisView } from "@/views/GitAnalysisView";
import { CommitView } from "@/views/CommitView";
import { PRView } from "@/views/PRView";
import { SettingsView } from "@/views/SettingsView";
import { useAppStore, type ViewId } from "@/store/useAppStore";
import { pageVariants } from "@/lib/motion";

const VIEWS: Record<ViewId, () => React.JSX.Element> = {
  dashboard: DashboardView,
  analysis: GitAnalysisView,
  commit: CommitView,
  pr: PRView,
  settings: SettingsView,
};

export default function App() {
  const view = useAppStore((s) => s.view);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const ActiveView = VIEWS[view];

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <AppShell>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="min-h-full"
          >
            <ActiveView />
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.17 0.014 260 / 90%)",
            backdropFilter: "blur(16px)",
            border: "1px solid oklch(1 0 0 / 10%)",
            color: "oklch(0.95 0.01 260)",
          },
        }}
      />
    </MotionConfig>
  );
}

import { lazy, Suspense, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RightPanel } from "./RightPanel";
import { CommandPalette } from "./CommandPalette";

// Code-split: three.js + R3F load in their own chunk after first paint.
const SceneBackground = lazy(() =>
  import("@/components/three/SceneBackground").then((m) => ({ default: m.SceneBackground })),
);

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Suspense fallback={<div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-40" aria-hidden />}>
        <SceneBackground />
      </Suspense>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <RightPanel />
      <CommandPalette />
    </div>
  );
}

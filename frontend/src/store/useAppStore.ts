import { create } from "zustand";

export type ViewId = "dashboard" | "analysis" | "commit" | "pr" | "settings";

export type ActivityKind = "scan" | "commit" | "pr" | "copy" | "system";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  timestamp: number;
}

export interface GeneratedOutput {
  id: string;
  kind: "commit" | "pr";
  content: string;
  timestamp: number;
  timeTakenSec?: number;
}

interface AppState {
  view: ViewId;
  setView: (view: ViewId) => void;

  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  activity: ActivityItem[];
  logActivity: (kind: ActivityKind, label: string) => void;

  outputs: GeneratedOutput[];
  addOutput: (output: Omit<GeneratedOutput, "id" | "timestamp">) => void;

  /* Settings */
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  show3D: boolean;
  setShow3D: (v: boolean) => void;
}

let idCounter = 0;
const uid = () => `${Date.now()}-${idCounter++}`;

export const useAppStore = create<AppState>((set) => ({
  view: "dashboard",
  setView: (view) => set({ view }),

  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),

  activity: [
    { id: uid(), kind: "system", label: "DevLog session started", timestamp: Date.now() },
  ],
  logActivity: (kind, label) =>
    set((state) => ({
      activity: [{ id: uid(), kind, label, timestamp: Date.now() }, ...state.activity].slice(0, 50),
    })),

  outputs: [],
  addOutput: (output) =>
    set((state) => ({
      outputs: [{ ...output, id: uid(), timestamp: Date.now() }, ...state.outputs].slice(0, 20),
    })),

  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  show3D: true,
  setShow3D: (show3D) => set({ show3D }),
}));

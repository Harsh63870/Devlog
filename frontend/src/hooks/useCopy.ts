import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

export function useCopy(label = "Copied to clipboard") {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const logActivity = useAppStore((s) => s.logActivity);

  const copy = useCallback(
    async (text: string) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(label);
        logActivity("copy", label);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Clipboard unavailable");
      }
    },
    [label, logActivity],
  );

  return { copied, copy };
}

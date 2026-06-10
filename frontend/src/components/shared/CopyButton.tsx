import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/useCopy";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md";
}

export function CopyButton({ text, label = "Copied to clipboard", size = "sm" }: CopyButtonProps) {
  const { copied, copy } = useCopy(label);

  return (
    <Button variant="ghost" size={size} onClick={() => copy(text)} disabled={!text} aria-label="Copy to clipboard">
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-accent-emerald"
          >
            <Check className="size-3.5" /> Copied
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Copy className="size-3.5" /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}

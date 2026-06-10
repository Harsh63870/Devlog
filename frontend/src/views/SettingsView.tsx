import { motion } from "framer-motion";
import { Box, Cpu, Gauge, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
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
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function SettingsView() {
  const show3D = useAppStore((s) => s.show3D);
  const setShow3D = useAppStore((s) => s.setShow3D);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="mx-auto flex max-w-3xl flex-col gap-6 p-8 max-md:p-5"
    >
      <SectionHeader title="Settings" description="Tune DevLog's appearance and runtime behavior." />

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
              icon={Cpu}
              title="AI model"
              description="Local model used for commit and PR generation, served by Ollama."
              control={<Badge tone="brand" className="font-mono">mistral</Badge>}
            />
            <SettingRow
              icon={Server}
              title="API endpoint"
              description="FastAPI backend that reads your staged git diff."
              control={<Badge tone="cyan" className="font-mono">localhost:8000</Badge>}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

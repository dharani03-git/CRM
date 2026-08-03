import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "accent";
  className?: string;
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-secondary-foreground";
  return (
    <Card className={cn("rounded-2xl border border-border/60 shadow-sm p-5 flex items-start gap-4", className)}>
      {Icon && (
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", toneCls)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground truncate">{value}</p>
        {delta && <p className="mt-0.5 text-xs text-muted-foreground">{delta}</p>}
      </div>
    </Card>
  );
}
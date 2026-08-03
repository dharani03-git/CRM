import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 py-12 px-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-background border">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-xs text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
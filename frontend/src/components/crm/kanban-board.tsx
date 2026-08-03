import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface KanbanColumn<T> {
  key: string;
  title: string;
  items: T[];
  accent?: string;
}

export function KanbanBoard<T>({
  columns,
  renderCard,
  className,
}: {
  columns: KanbanColumn<T>[];
  renderCard: (item: T) => ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-4 overflow-x-auto pb-2", className)}
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(260px, 1fr))` }}
    >
      {columns.map((c) => (
        <div key={c.key} className="flex min-w-0 flex-col rounded-2xl bg-muted/50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", c.accent ?? "bg-primary")} />
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
            </div>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground border">
              {c.items.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {c.items.map((item, i) => (
              <Card key={i} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
                {renderCard(item)}
              </Card>
            ))}
            {c.items.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No items</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
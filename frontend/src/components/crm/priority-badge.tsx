import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/mock-data";

const styles: Record<Priority, string> = {
  High: "bg-rose-100 text-rose-800 border-rose-200",
  Medium: "bg-amber-100 text-amber-900 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", styles[priority], className)}>
      {priority}
    </Badge>
  );
}
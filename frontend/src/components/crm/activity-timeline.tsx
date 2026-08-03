import { cn } from "@/lib/utils";
import { Phone, Mail, MessageCircle, Calendar, StickyNote, UserPlus, Activity } from "lucide-react";
import type { ActivityEvent } from "@/lib/mock-data";

const iconMap = {
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Calendar,
  note: StickyNote,
  assignment: UserPlus,
  status: Activity,
} as const;

export function ActivityTimeline({ events, className }: { events: ActivityEvent[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-4 border-l border-border pl-6", className)}>
      {events.map((e) => {
        const Icon = iconMap[e.type];
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm text-foreground">{e.summary}</p>
            <p className="text-xs text-muted-foreground">
              {e.actor} · {new Date(e.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
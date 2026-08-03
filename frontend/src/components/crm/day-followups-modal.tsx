import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type FollowUp } from "@/lib/mock-data";
import { FollowUpCard } from "./follow-up-card";
import { CalendarDays } from "lucide-react";

interface DayFollowUpsModalProps {
  date: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUps: FollowUp[];
}

export function DayFollowUpsModal({ date, open, onOpenChange, followUps }: DayFollowUpsModalProps) {
  if (!date) return null;

  const dateString = date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>Follow-ups for {dateString}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {followUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <div className="rounded-full bg-muted p-3">
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No Follow-ups Scheduled</p>
              <p className="text-xs text-muted-foreground">There are no client calls or meetings set for this date.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
              {followUps.map((f) => (
                <FollowUpCard key={f.id} item={f} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

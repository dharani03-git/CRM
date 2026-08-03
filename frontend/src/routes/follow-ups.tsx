import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FollowUpCard } from "@/components/crm/follow-up-card";
import { AddFollowUpModal } from "@/components/crm/add-followup-modal";
import { DayFollowUpsModal } from "@/components/crm/day-followups-modal";
import { useCRMStore } from "@/lib/crm-store";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — Kottravai CRM" },
      { name: "description", content: "Daily and upcoming lead follow-ups across calls, WhatsApp, email and meetings." },
      { property: "og:title", content: "Follow-ups — Kottravai CRM" },
      { property: "og:description", content: "Schedule and track follow-ups with prospects." },
    ],
  }),
  component: FollowUpsPage,
});

function FollowUpsPage() {
  const { followUps } = useCRMStore();
  const [view, setView] = useState<"month" | "week">("month");
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayOpen, setDayOpen] = useState(false);

  const today = new Date().toDateString();
  const now = Date.now();
  const todayList = followUps.filter((f) => new Date(f.time).toDateString() === today);
  const upcoming = followUps.filter((f) => new Date(f.time).getTime() > now && new Date(f.time).toDateString() !== today);
  const overdue = followUps.filter((f) => new Date(f.time).getTime() < now && f.status !== "Done");

  const selectedDayFollowUps = selectedDate
    ? followUps.filter((f) => new Date(f.time).toDateString() === selectedDate.toDateString())
    : [];

  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 15 + i);
    return d;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Follow-ups</h2>
          <p className="text-sm text-muted-foreground">Stay on top of every prospect conversation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === "month" ? "week" : "month")}>
            <CalendarIcon className="mr-1 h-4 w-4" /> {view === "month" ? "Month" : "Week"}
          </Button>
          <Button onClick={() => setOpen(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> New follow-up
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2 text-xs">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center font-medium text-muted-foreground">{d}</div>
          ))}
          {days.map((d) => {
            const count = followUps.filter((f) => new Date(f.time).toDateString() === d.toDateString()).length;
            const isToday = d.toDateString() === today;
            return (
              <div
                key={d.toISOString()}
                onClick={() => {
                  setSelectedDate(d);
                  setDayOpen(true);
                }}
                className={`min-h-16 rounded-xl border p-2 cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/5 ${
                  isToday ? "border-primary bg-primary/5" : "border-border/50"
                }`}
              >
                <p className={`text-xs ${isToday ? "font-bold text-primary" : "text-foreground"}`}>{d.getDate()}</p>
                {count > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today ({todayList.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {todayList.length === 0 ? <p className="text-xs text-muted-foreground">No follow-ups for today.</p> : todayList.map((f) => <FollowUpCard key={f.id} item={f} />)}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.length === 0 ? <p className="text-xs text-muted-foreground">No upcoming follow-ups.</p> : upcoming.map((f) => <FollowUpCard key={f.id} item={f} />)}
        </TabsContent>
        <TabsContent value="overdue" className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {overdue.length === 0 ? <p className="text-xs text-muted-foreground">No overdue follow-ups.</p> : overdue.map((f) => <FollowUpCard key={f.id} item={f} />)}
        </TabsContent>
      </Tabs>

      <AddFollowUpModal open={open} onOpenChange={setOpen} />
      <DayFollowUpsModal date={selectedDate} open={dayOpen} onOpenChange={setDayOpen} followUps={selectedDayFollowUps} />
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StatCard } from "@/components/crm/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmployeeAvatar } from "@/components/crm/employee-avatar";
import { StatusBadge } from "@/components/crm/status-badge";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { FollowUpCard } from "@/components/crm/follow-up-card";
import { AddLeadModal } from "@/components/crm/add-lead-modal";
import { useCRMStore } from "@/lib/crm-store";
import {
  Users,
  UserPlus,
  CalendarClock,
  Trophy,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatINR, LEAD_STATUSES, leadSources } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Kottravai CRM" },
      { name: "description", content: "Overview of leads, follow-ups, quotations and employee sales performance." },
      { property: "og:title", content: "Dashboard — Kottravai CRM" },
      { property: "og:description", content: "Overview of Kottravai's B2B sales pipeline." },
    ],
  }),
  component: Dashboard,
});

const PALETTE = ["#143C38", "#C89B3C", "#3d7d74", "#8a6a26", "#5a9d94", "#a88541", "#2c5852"];

function Dashboard() {
  const { role } = useRole();
  const { leads, followUps, employees } = useCRMStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const todaysFollowUps = followUps.filter((f) => {
    const d = new Date(f.time);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const funnelData = LEAD_STATUSES.filter((s) => s !== "Lost").map((s) => ({
    stage: s,
    count: leads.filter((l) => l.status === s).length,
  }));

  const sourceData = leadSources.map((s) => ({ name: s, value: leads.filter((l) => l.source === s).length }));

  const perfData = employees
    .filter((e) => e.target > 0)
    .map((e) => ({ name: e.name.split(" ")[0], target: e.target / 1000, achieved: e.achieved / 1000 }));

  const wonRevenue = leads.filter((l) => l.status === "Won").reduce((s, l) => s + l.estimatedValue, 0);

  const recentActivity = leads
    .flatMap((l) => l.activity.map((a) => ({ ...a, company: l.company })))
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 6);

  const roleGreeting =
    role === "super_admin"
      ? "All leads across the organisation"
      : role === "sales_manager"
        ? "Team leads and performance"
        : "Your leads, follow-ups and tasks";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back 👋</h2>
          <p className="text-sm text-muted-foreground">{roleGreeting}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/reports">View reports</Link></Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2"><UserPlus className="h-4 w-4" /> Add lead</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={leads.length} delta="+3 this week" icon={Users} tone="primary" />
        <StatCard label="New Today" value={leads.filter((l) => l.status === "New").length} icon={UserPlus} />
        <StatCard label="Pending Follow-ups" value={followUps.filter((f) => f.status !== "Done").length} icon={CalendarClock} tone="accent" />
        <StatCard label="Won Deals" value={leads.filter((l) => l.status === "Won").length} icon={Trophy} tone="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Conversion funnel</h3>
              <p className="text-xs text-muted-foreground">Leads at each pipeline stage</p>
            </div>
          </div>
          <div className="space-y-2">
            {leads.length === 0 ? (
              <p className="text-xs text-muted-foreground">No leads in the database.</p>
            ) : (
              funnelData.map((f, i) => {
                const max = Math.max(...funnelData.map((x) => x.count), 1);
                const pct = (f.count / max) * 100;
                return (
                  <div key={f.stage} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-muted-foreground">{f.stage}</span>
                    <div className="flex-1 rounded-full bg-muted h-6 overflow-hidden">
                      <div
                        className="h-6 rounded-full text-white text-xs flex items-center justify-end pr-2 font-medium"
                        style={{ width: `${Math.max(pct, 8)}%`, background: PALETTE[i % PALETTE.length] }}
                      >
                        {f.count}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Leads by source</h3>
          <div className="h-64">
            {leads.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No source data available</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sourceData} innerRadius={45} outerRadius={80} dataKey="value" nameKey="name">
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Employee performance (₹ '000)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={perfData}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="target" fill="#C89B3C" radius={[6, 6, 0, 0]} />
                <Bar dataKey="achieved" fill="#143C38" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Today's follow-ups</h3>
            <Link to="/follow-ups" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {todaysFollowUps.length === 0 && <p className="text-xs text-muted-foreground">No follow-ups today.</p>}
            {todaysFollowUps.map((f) => (
              <FollowUpCard key={f.id} item={f} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Recent activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent activity logged.</p>
          ) : (
            <ActivityTimeline events={recentActivity as any} />
          )}
        </Card>
        <Card className="rounded-2xl p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">My personal target</h3>
          {employees.slice(0, 3).length === 0 ? (
            <p className="text-xs text-muted-foreground">No target data available</p>
          ) : (
            employees.slice(0, 3).map((e) => {
              const pct = e.target ? Math.round((e.achieved / e.target) * 100) : 0;
              return (
                <div key={e.id} className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <EmployeeAvatar employeeId={e.id} showName size="sm" />
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-2 h-2" />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatINR(e.achieved)} / {formatINR(e.target)}
                  </p>
                </div>
              );
            })
          )}
        </Card>
      </div>

      <AddLeadModal open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

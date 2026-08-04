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

  if (role === "sales_executive") {
    return <SalesDashboard />;
  }

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

function SalesDashboard() {
  const { leads, followUps, tasks, employees } = useCRMStore();
  const { currentUser } = useRole();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const myLeads = leads;
  const myFollowUps = followUps;
  const myTasks = tasks;

  const todaysFollowUps = myFollowUps.filter((f) => {
    const d = new Date(f.time);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const pendingTasks = myTasks.filter((t) => t.status !== "Completed");

  const myRecord = employees.find((e) => e.id === currentUser.id) || {
    target: 0,
    achieved: 0,
    name: currentUser.name
  };

  const targetPct = myRecord.target ? Math.round((myRecord.achieved / myRecord.target) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, {currentUser.name} 👋</h2>
          <p className="text-sm text-muted-foreground">Your leads, follow-ups, and tasks overview.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-[#8e2a8b] hover:bg-[#a636a3] text-white">
            <UserPlus className="h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Simplified Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Leads" value={myLeads.length} icon={Users} tone="primary" />
        <StatCard label="New Today" value={myLeads.filter((l) => l.status === "New").length} icon={UserPlus} />
        <StatCard label="Today's Follow-ups" value={todaysFollowUps.length} icon={CalendarClock} tone="accent" />
        <StatCard label="My Won Deals" value={myLeads.filter((l) => l.status === "Won").length} icon={Trophy} tone="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: My Leads & Tasks */}
        <div className="lg:col-span-2 space-y-4">
          {/* My Leads Card */}
          <Card className="rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Active Leads</h3>
                <p className="text-xs text-muted-foreground">Leads currently in your pipeline</p>
              </div>
              <Link to="/leads" className="text-xs text-[#8e2a8b] font-bold hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-auto pr-1">
              {myLeads.length === 0 && <p className="text-xs text-muted-foreground py-4">No active leads assigned to you.</p>}
              {myLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{lead.company}</h4>
                    <p className="text-[10px] text-slate-400">{lead.contact} • {lead.city}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">{formatINR(lead.estimatedValue)}</span>
                    <StatusBadge status={lead.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* My Tasks Card */}
          <Card className="rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">My Pending Tasks</h3>
                <p className="text-xs text-muted-foreground">Tasks requiring your attention</p>
              </div>
              <Link to="/tasks" className="text-xs text-[#8e2a8b] font-bold hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-auto pr-1">
              {pendingTasks.length === 0 && <p className="text-xs text-muted-foreground py-4">All tasks completed! Good job.</p>}
              {pendingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{task.title}</h4>
                    <p className="text-[10px] text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === "High" ? "bg-red-50 text-red-600 border border-red-200" :
                      task.priority === "Medium" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                      "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}>{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Follow-ups & Target progress */}
        <div className="space-y-4">
          {/* Target Progress */}
          <Card className="rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-foreground mb-3">Sales Target Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-slate-500 font-medium">Achieved Target</span>
                <span className="text-xs font-bold text-[#8e2a8b]">{targetPct}%</span>
              </div>
              <Progress value={targetPct} className="h-2.5 bg-slate-100" />
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                <span>Won: {formatINR(myRecord.achieved)}</span>
                <span>Target: {formatINR(myRecord.target)}</span>
              </div>
            </div>
          </Card>

          {/* Today's Follow-ups */}
          <Card className="rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Today's Follow-ups</h3>
              <Link to="/follow-ups" className="text-xs text-[#8e2a8b] font-bold hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
              {todaysFollowUps.length === 0 && <p className="text-xs text-muted-foreground py-4">No follow-ups scheduled for today.</p>}
              {todaysFollowUps.map((f) => (
                <FollowUpCard key={f.id} item={f} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AddLeadModal open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

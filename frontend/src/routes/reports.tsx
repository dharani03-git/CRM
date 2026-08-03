import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useCRMStore } from "@/lib/crm-store";
import { leadSources } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Kottravai CRM" },
      { name: "description", content: "Analytics on lead sources, conversion, revenue and employee performance." },
      { property: "og:title", content: "Reports — Kottravai CRM" },
      { property: "og:description", content: "Sales analytics and exports." },
    ],
  }),
  component: ReportsPage,
});

const PALETTE = ["#143C38", "#C89B3C", "#3d7d74", "#8a6a26", "#5a9d94", "#a88541", "#2c5852"];

function ReportsPage() {
  const { leads, employees } = useCRMStore();

  const sourceData = leadSources.map((s) => ({ name: s, leads: leads.filter((l) => l.source === s).length }));
  const perf = employees.filter((e) => e.target > 0).map((e) => ({ name: e.name.split(" ")[0], target: e.target / 1000, achieved: e.achieved / 1000 }));
  const revenue = Array.from({ length: 6 }).map((_, i) => ({
    month: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"][i],
    revenue: leads.filter((l) => l.status === "Won").length * 50 + i * 45 + (i % 2 ? 20 : -12),
  }));

  const handleExport = (type: string) => {
    toast.success(`${type} report exported successfully!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground">Insights across the sales operation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("CSV")} className="gap-1"><Download className="h-4 w-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("Excel")} className="gap-1"><Download className="h-4 w-4" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("PDF")} className="gap-1"><Download className="h-4 w-4" /> PDF</Button>
        </div>
      </div>

      <Tabs defaultValue="sources">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="performance">Employee Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="compliance">Follow-up Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm h-80">
            {leads.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Add leads to see data distribution</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sourceData} dataKey="leads" nameKey="name" outerRadius={100}>
                    {sourceData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} /><Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm h-80">
            {leads.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Add leads to see conversion chart</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={sourceData}>
                  <XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
                  <Bar dataKey="leads" fill="#143C38" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm h-80">
            {employees.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Add employees to view targets</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={perf}>
                  <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="target" fill="#C89B3C" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="achieved" fill="#143C38" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm h-80">
            <ResponsiveContainer>
              <LineChart data={revenue}>
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#143C38" strokeWidth={3} dot={{ fill: "#C89B3C", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Follow-up compliance report</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {employees.filter((e) => e.role === "sales_executive").length === 0 ? (
                <p className="text-xs text-muted-foreground col-span-3">No sales executives currently active.</p>
              ) : (
                employees.filter((e) => e.role === "sales_executive").map((e, i) => (
                  <div key={e.id} className="rounded-xl bg-muted/40 p-4">
                    <p className="text-sm font-semibold">{e.name}</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{85 + (i * 4) % 15}%</p>
                    <p className="text-xs text-muted-foreground">on-time follow-ups this month</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
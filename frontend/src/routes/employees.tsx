import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmployeeAvatar } from "@/components/crm/employee-avatar";
import { GenericStatusBadge } from "@/components/crm/status-badge";
import { StatCard } from "@/components/crm/stat-card";
import { Button } from "@/components/ui/button";
import { AddEmployeeModal } from "@/components/crm/add-employee-modal";
import { EditEmployeeModal } from "@/components/crm/edit-employee-modal";
import { useCRMStore } from "@/lib/crm-store";
import { formatINR, type Employee } from "@/lib/mock-data";
import { Users, Trophy, IndianRupee, Target, Mail, Phone, Plus, Trash, Edit2 } from "lucide-react";
import { roleLabels } from "@/lib/role-context";
import { toast } from "sonner";

export const Route = createFileRoute("/employees")({
  head: () => ({
    meta: [
      { title: "Employees — Kottravai CRM" },
      { name: "description", content: "Sales team directory with performance and lead ownership." },
      { property: "og:title", content: "Employees — Kottravai CRM" },
      { property: "og:description", content: "Team directory and monthly performance." },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { employees, leads, deleteEmployee } = useCRMStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(employeeId);
        toast.success("Employee deleted successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete employee");
      }
    }
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditOpen(true);
  };

  const totalTarget = employees.reduce((s, e) => s + e.target, 0);
  const totalAchieved = employees.reduce((s, e) => s + e.achieved, 0);

  // Find the top performer dynamically
  const topPerformer = employees
    .filter((e) => e.target > 0)
    .sort((a, b) => b.achieved - a.achieved)[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Employees</h2>
          <p className="text-sm text-muted-foreground">Team directory and monthly performance</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Team size" value={employees.length} icon={Users} tone="primary" />
        <StatCard label="Monthly target" value={formatINR(totalTarget)} icon={Target} />
        <StatCard label="Achieved" value={formatINR(totalAchieved)} icon={IndianRupee} tone="accent" />
        <StatCard label="Top performer" value={topPerformer ? topPerformer.name : "N/A"} icon={Trophy} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((e) => {
          const pct = e.target ? Math.round((e.achieved / e.target) * 100) : 0;
          const myLeads = leads.filter((l) => l.ownerId === e.id).length;
          return (
            <Card key={e.id} className="rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <EmployeeAvatar employeeId={e.id} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabels[e.role]} · {e.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <GenericStatusBadge status={e.status} />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(e)}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteEmployee(e.id)}><Trash className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {e.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {e.phone}</p>
              </div>
              {e.target > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Monthly target</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-1 h-2" />
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatINR(e.achieved)} / {formatINR(e.target)}</p>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Owned leads</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">{myLeads}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <AddEmployeeModal open={isAddOpen} onOpenChange={setIsAddOpen} />
      <EditEmployeeModal employee={selectedEmployee} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterBar } from "@/components/crm/filter-bar";
import { DataTable } from "@/components/crm/data-table";
import { StatusBadge } from "@/components/crm/status-badge";
import { PriorityBadge } from "@/components/crm/priority-badge";
import { EmployeeAvatar } from "@/components/crm/employee-avatar";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { AddLeadModal } from "@/components/crm/add-lead-modal";
import { useCRMStore } from "@/lib/crm-store";
import {
  leadSources,
  categories,
  LEAD_STATUSES,
  type Lead,
} from "@/lib/mock-data";
import { Plus, Eye, Edit, Trash } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";
import { EditLeadModal } from "@/components/crm/edit-lead-modal";

export const Route = createFileRoute("/leads/")({
  component: LeadsIndex,
});

function LeadsIndex() {
  const { leads: allLeads, employees, deleteLead } = useCRMStore();
  const { role, currentUser } = useRole();

  const handleDeleteLead = async (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead? All associated data will be deleted.")) {
      try {
        await deleteLead(leadId);
        toast.success("Lead deleted successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete lead");
      }
    }
  };
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("__all__");
  const [source, setSource] = useState("__all__");
  const [category, setCategory] = useState("__all__");
  const [priority, setPriority] = useState("__all__");
  const [owner, setOwner] = useState("__all__");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const scoped = useMemo(() => {
    if (role === "sales_executive") return allLeads.filter((l) => l.ownerId === currentUser.id);
    return allLeads;
  }, [allLeads, role, currentUser.id]);

  const filtered = scoped.filter((l) => {
    const q = search.toLowerCase();
    if (q && !`${l.company} ${l.contact} ${l.email} ${l.id}`.toLowerCase().includes(q)) return false;
    if (status !== "__all__" && l.status !== status) return false;
    if (source !== "__all__" && l.source !== source) return false;
    if (category !== "__all__" && l.category !== category) return false;
    if (priority !== "__all__" && l.priority !== priority) return false;
    if (owner !== "__all__" && l.ownerId !== owner) return false;
    return true;
  });

  const scopeLabel =
    role === "sales_executive" ? "My Leads" : role === "sales_manager" ? "Team Leads" : "All Leads";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{scopeLabel}</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} leads in view</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        filters={[
          { label: "Status", current: status, onChange: setStatus, options: LEAD_STATUSES.map((s) => ({ label: s, value: s })) },
          { label: "Source", current: source, onChange: setSource, options: leadSources.map((s) => ({ label: s, value: s })) },
          { label: "Category", current: category, onChange: setCategory, options: categories.map((s) => ({ label: s, value: s })) },
          { label: "Priority", current: priority, onChange: setPriority, options: ["Low", "Medium", "High"].map((s) => ({ label: s, value: s })) },
          { label: "Owner", current: owner, onChange: setOwner, options: employees.filter((e) => e.role === "sales_executive").map((e) => ({ label: e.name, value: e.id })) },
        ]}
      />

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-4">
          <DataTable<Lead>
            rows={filtered}
            columns={[
              { header: "Date", cell: (l) => <span className="text-xs">{l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN") : "N/A"}</span> },
              { header: "Name", cell: (l) => <div><p className="font-semibold text-foreground">{l.contact}</p><p className="text-xs text-muted-foreground">{l.company}</p></div> },
              { header: "Mobile Number", cell: (l) => <span className="text-sm">{l.mobile}</span> },
              { header: "Email", cell: (l) => <span className="text-xs text-muted-foreground">{l.email || "N/A"}</span> },
              { header: "Lead Source", cell: (l) => <span className="text-sm">{l.source}</span> },
              { header: "Category", cell: (l) => <span className="text-sm">{l.category}</span> },
              { header: "Contacted", cell: (l) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${l.contacted ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-400/15 text-slate-600"}`}>{l.contacted ? "Yes" : "No"}</span> },
              { header: "Current Status", cell: (l) => <StatusBadge status={l.status} /> },
              { header: "Notes", cell: (l) => <span className="text-xs text-muted-foreground block max-w-xs truncate">{l.notes || "No notes"}</span> },
              { header: "Next Follow-up", cell: (l) => <span className="text-xs">{l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleDateString("en-IN") : "N/A"}</span> },
              { header: "Assigned To", cell: (l) => <EmployeeAvatar employeeId={l.ownerId} showName /> },
              {
                header: "Actions",
                cell: (l) => (
                  <div className="flex gap-1">
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8"><Link to="/leads/$id" params={{ id: l.id }}><Eye className="h-4 w-4" /></Link></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedLead(l); setEditLeadOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteLead(l.id)}><Trash className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>
        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard
            columns={LEAD_STATUSES.map((s) => ({
              key: s,
              title: s,
              items: filtered.filter((l) => l.status === s),
            }))}
            renderCard={(l) => (
              <Link to="/leads/$id" params={{ id: l.id }} className="block">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{l.company}</p>
                  <PriorityBadge priority={l.priority} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{l.contact} · {l.city}</p>
                <div className="mt-3 flex items-center justify-between">
                  <EmployeeAvatar employeeId={l.ownerId} />
                  <span className="text-[11px] text-muted-foreground">{l.source}</span>
                </div>
              </Link>
            )}
          />
        </TabsContent>
      </Tabs>

      <AddLeadModal open={isAddOpen} onOpenChange={setIsAddOpen} />
      {selectedLead && (
        <EditLeadModal open={editLeadOpen} onOpenChange={setEditLeadOpen} lead={selectedLead} />
      )}
    </div>
  );
}
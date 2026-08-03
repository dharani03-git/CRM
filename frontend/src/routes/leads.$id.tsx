import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/crm/status-badge";
import { PriorityBadge } from "@/components/crm/priority-badge";
import { EmployeeAvatar } from "@/components/crm/employee-avatar";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { FollowUpCard } from "@/components/crm/follow-up-card";
import { AddFollowUpModal } from "@/components/crm/add-followup-modal";
import { EditLeadModal } from "@/components/crm/edit-lead-modal";
import { useCRMStore } from "@/lib/crm-store";
import { useRole } from "@/lib/role-context";
import { formatINR, type LeadStatus } from "@/lib/mock-data";
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, Building2, UserCog, Paperclip, Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/leads/$id")({
  component: LeadDetail,
});

export function LeadDetail() {
  const { id } = Route.useParams();
  const { leads, employees, followUps, updateLeadOwner, updateLeadStatus, addLeadActivity, deleteLead } = useCRMStore();
  const { currentUser } = useRole();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this lead? All associated data will be deleted.")) {
      try {
        await deleteLead(lead.id);
        toast.success("Lead deleted successfully!");
        navigate({ to: "/leads" });
      } catch (err: any) {
        toast.error(err.message || "Failed to delete lead");
      }
    }
  };

  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignOwnerId, setReassignOwnerId] = useState("");
  const [reassignNote, setReassignNote] = useState("");

  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [newNote, setNewNote] = useState("");

  const lead = leads.find((l) => l.id === id);
  if (!lead) throw notFound();

  const leadFollowUps = followUps.filter((f) => f.leadId === lead.id);

  const handleReassign = () => {
    if (!reassignOwnerId) {
      toast.error("Please select a new owner");
      return;
    }
    updateLeadOwner(lead.id, reassignOwnerId, reassignNote || "Reassigned from details page.", currentUser);
    toast.success("Lead reassigned successfully!");
    setReassignOpen(false);
    setReassignNote("");
  };

  const handleStatusChange = (status: LeadStatus) => {
    updateLeadStatus(lead.id, status, currentUser);
    toast.success(`Status updated to ${status}`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addLeadActivity(lead.id, {
      type: "note",
      actor: currentUser.name,
      summary: newNote,
    });
    toast.success("Note saved successfully!");
    setNewNote("");
  };

  return (
    <div className="space-y-4">
      <Link to="/leads" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      <Card className="rounded-2xl p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-bold text-foreground">{lead.company}</h2>
              <span className="font-mono text-xs text-muted-foreground">{lead.id}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lead.contact} · {lead.designation} · {lead.city}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select value={lead.status} onValueChange={(val) => handleStatusChange(val as LeadStatus)}>
                <SelectTrigger className="w-[180px] h-8 p-0 border-none bg-transparent hover:bg-muted/40">
                  <SelectValue><StatusBadge status={lead.status} /></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Quotation Sent">Quotation Sent</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Sample Requested">Sample Requested</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <PriorityBadge priority={lead.priority} />
              <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs">
                <UserCog className="h-3 w-3" /> Owner:
                <EmployeeAvatar employeeId={lead.ownerId} showName />
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-1" onClick={() => toast.info(`Calling ${lead.contact} at ${lead.mobile}...`)}><Phone className="h-4 w-4" /> Call</Button>
            <Button variant="outline" className="gap-1" onClick={() => window.open(`https://wa.me/${lead.mobile.replace(/[^0-9]/g, "")}`)}><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
            <Button variant="outline" className="gap-1" onClick={() => window.open(`mailto:${lead.email}`)}><Mail className="h-4 w-4" /> Email</Button>
            <Button variant="outline" className="gap-1" onClick={() => setEditOpen(true)}><Edit className="h-4 w-4" /> Edit</Button>
            <Button variant="outline" className="gap-1 border-destructive text-destructive hover:bg-destructive/10" onClick={handleDelete}><Trash className="h-4 w-4" /> Delete</Button>
            <Sheet open={reassignOpen} onOpenChange={setReassignOpen}>
              <SheetTrigger asChild>
                <Button className="gap-1"><UserCog className="h-4 w-4" /> Reassign</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Reassign lead</SheetTitle>
                  <SheetDescription>Transfer ownership of {lead.company} to another employee.</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Assign to</Label>
                    <Select value={reassignOwnerId} onValueChange={setReassignOwnerId}>
                      <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.filter((e) => e.role !== "super_admin").map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.name} — {e.department}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={reassignNote} onChange={(e) => setReassignNote(e.target.value)} placeholder="Reason for reassignment" />
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setReassignOpen(false)}>Cancel</Button>
                  <Button onClick={handleReassign}>Reassign</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card className="rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Company & contact</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
              <Row icon={Building2} label="Company" value={lead.company} />
              <Row icon={MapPin} label="City" value={lead.city} />
              <Row icon={Phone} label="Mobile" value={lead.mobile} />
              <Row icon={Mail} label="Email" value={lead.email} />
              <Row icon={Building2} label="Source" value={lead.source} />
              <Row icon={Building2} label="Category" value={lead.category} />
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Product interests</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.productInterests.length === 0 ? (
                <p className="text-xs text-muted-foreground">No specific products selected.</p>
              ) : (
                lead.productInterests.map((p) => (
                  <span key={p} className="rounded-full border bg-accent/20 px-3 py-1 text-xs font-medium">{p}</span>
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Assignment history</h3>
            <ol className="mt-3 space-y-2 text-sm">
              {lead.assignmentHistory.map((h, i) => (
                <li key={i} className="flex items-start gap-2 rounded-xl bg-muted/40 p-3">
                  <UserCog className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="min-w-0">
                    <p><span className="font-semibold">{h.to}</span> — assigned by {h.by}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleString("en-IN")}</p>
                    {h.note && <p className="mt-1 text-xs">{h.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl p-5 shadow-sm">
            <Tabs defaultValue="timeline">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="timeline">Activity</TabsTrigger>
                <TabsTrigger value="followups">Follow-ups</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <ActivityTimeline events={lead.activity} />
              </TabsContent>
              <TabsContent value="followups" className="mt-4 space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Follow-ups</span>
                  <Button size="xs" variant="outline" className="h-7 text-[10px] p-2 gap-1" onClick={() => setFollowUpOpen(true)}>
                    <Plus className="h-3 w-3" /> Schedule
                  </Button>
                </div>
                {leadFollowUps.length === 0 && <p className="text-xs text-muted-foreground">No follow-ups scheduled.</p>}
                {leadFollowUps.map((f) => <FollowUpCard key={f.id} item={f} />)}
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note..." className="min-h-24" />
                <Button className="mt-2" size="sm" onClick={handleAddNote}>Save note</Button>
                <p className="mt-4 text-sm text-foreground/80">{lead.notes}</p>
              </TabsContent>
              <TabsContent value="files" className="mt-4">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Drop files here or click to upload</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <AddFollowUpModal open={followUpOpen} onOpenChange={setFollowUpOpen} prefilledLeadId={lead.id} />
      <EditLeadModal open={editOpen} onOpenChange={setEditOpen} lead={lead} />
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
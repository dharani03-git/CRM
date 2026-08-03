import { useState } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { useRole } from "@/lib/role-context";
import { leadSources, categories, LEAD_STATUSES, type LeadStatus, type Priority } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddLeadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addLead, employees } = useCRMStore();
  const { currentUser } = useRole();

  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [designation, setDesignation] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState(leadSources[0]);
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [ownerId, setOwnerId] = useState("");
  const [status, setStatus] = useState<LeadStatus>("New");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [city, setCity] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [note, setNote] = useState("");
  const [contacted, setContacted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set default ownerId once employees are loaded
  useState(() => {
    if (employees.length > 0 && !ownerId) {
      setOwnerId(employees[0].id);
    }
  });

  const salesExecutives = employees.filter((e) => e.role === "sales_executive");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveOwnerId = ownerId || employees[0]?.id;
    if (!company || !contact || !mobile || !email || !effectiveOwnerId) {
      toast.error("Please fill in all required fields (Company, Contact Name, Mobile, Email, and Owner)");
      return;
    }

    setLoading(true);
    try {
      await addLead(
        {
          company,
          contact,
          designation,
          mobile,
          email,
          source,
          category,
          priority,
          ownerId: effectiveOwnerId,
          status,
          nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : new Date().toISOString(),
          city,
          productInterests: [],
          estimatedValue: Number(estimatedValue) || 0,
          notes,
          note,
          contacted,
        },
        currentUser
      );

      toast.success("Lead added successfully!");
      onOpenChange(false);

      // Reset Form
      setCompany("");
      setContact("");
      setDesignation("");
      setMobile("");
      setEmail("");
      setSource(leadSources[0]);
      setCategory(categories[0]);
      setPriority("Medium");
      setOwnerId(employees[0]?.id || "");
      setStatus("New");
      setNextFollowUp("");
      setCity("");
      setEstimatedValue("");
      setNotes("");
      setNote("");
      setContacted(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Sundaram Textiles" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact">Contact Name *</Label>
              <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. Karthik Sundaram" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. COO" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Chennai" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. +91 98407 12345" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. karthik@sundaram.com" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="source">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as LeadStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="estimatedValue">Est. Value (INR)</Label>
              <Input id="estimatedValue" type="number" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} placeholder="e.g. 50000" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="owner">Lead Owner *</Label>
              <Select value={ownerId} onValueChange={setOwnerId} disabled={loading}>
                <SelectTrigger id="owner">
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.role.replace("_", " ")})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="nextFollowUp">Next Follow-up Date</Label>
              <Input id="nextFollowUp" type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contacted">Contacted</Label>
              <Select value={contacted ? "yes" : "no"} onValueChange={(val) => setContacted(val === "yes")} disabled={loading}>
                <SelectTrigger id="contacted">
                  <SelectValue placeholder="Contacted?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General notes about the lead..." />
          </div>

          <div className="space-y-1">
            <Label htmlFor="note">Creation Log / First Activity Note</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Discussed coconut bowls pricing proposal" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { leadSources, categories, LEAD_STATUSES, type Lead, type LeadStatus, type Priority } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function EditLeadModal({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
}) {
  const { editLead, employees } = useCRMStore();

  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [designation, setDesignation] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [ownerId, setOwnerId] = useState("");
  const [status, setStatus] = useState<LeadStatus>("New");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [city, setCity] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [contacted, setContacted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setCompany(lead.company || "");
      setContact(lead.contact || "");
      setDesignation(lead.designation || "");
      setMobile(lead.mobile || "");
      setEmail(lead.email || "");
      setSource(lead.source || leadSources[0]);
      setCategory(lead.category || categories[0]);
      setPriority(lead.priority || "Medium");
      setOwnerId(lead.ownerId || "");
      setStatus(lead.status || "New");
      setCity(lead.city || "");
      setEstimatedValue(lead.estimatedValue?.toString() || "0");
      setNotes(lead.notes || "");
      setContacted(lead.contacted || false);

      if (lead.nextFollowUp) {
        // Format ISO date to yyyy-MM-dd for HTML input
        const dateObj = new Date(lead.nextFollowUp);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        setNextFollowUp(`${yyyy}-${mm}-${dd}`);
      } else {
        setNextFollowUp("");
      }
    }
  }, [lead, open]);

  const salesExecutives = employees.filter((e) => e.role === "sales_executive");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !contact || !mobile || !email || !ownerId) {
      toast.error("Please fill in all required fields (Company, Contact Name, Mobile, Email, and Owner)");
      return;
    }

    setLoading(true);
    try {
      await editLead(lead.id, {
        company,
        contact,
        designation,
        mobile,
        email,
        source,
        category,
        priority,
        ownerId,
        status,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
        city,
        estimatedValue: Number(estimatedValue) || 0,
        notes,
        contacted,
      });

      toast.success("Lead updated successfully!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact">Contact Name *</Label>
              <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="source">Source</Label>
              <Select value={source} onValueChange={setSource} disabled={loading}>
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
              <Select value={category} onValueChange={setCategory} disabled={loading}>
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
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)} disabled={loading}>
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
              <Select value={status} onValueChange={(val) => setStatus(val as LeadStatus)} disabled={loading}>
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
              <Input id="estimatedValue" type="number" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} disabled={loading} />
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
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General notes about the lead..." disabled={loading} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

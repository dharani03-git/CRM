import { useState, useEffect } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function AddFollowUpModal({
  open,
  onOpenChange,
  prefilledLeadId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledLeadId?: string;
}) {
  const { addFollowUp, leads } = useCRMStore();

  const [leadId, setLeadId] = useState(prefilledLeadId || "");
  const [time, setTime] = useState("");
  const [method, setMethod] = useState<"Call" | "WhatsApp" | "Email" | "Meeting">("Call");
  const [status, setStatus] = useState<"Pending" | "Done" | "Overdue">("Pending");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefilledLeadId) {
      setLeadId(prefilledLeadId);
    }
  }, [prefilledLeadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !time) {
      toast.error("Please fill in all required fields (Associated Lead, Follow-up Date/Time)");
      return;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) {
      toast.error("Selected lead not found!");
      return;
    }

    setLoading(true);
    try {
      await addFollowUp({
        leadId,
        company: lead.company,
        contact: lead.contact,
        time: new Date(time).toISOString(),
        method,
        ownerId: lead.ownerId,
        status,
        notes,
      });

      toast.success("Follow-up scheduled successfully!");
      onOpenChange(false);

      // Reset Form
      setTime("");
      setMethod("Call");
      setStatus("Pending");
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule follow-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Follow-Up Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="lead">Associated Lead *</Label>
            <Select value={leadId} onValueChange={setLeadId} disabled={!!prefilledLeadId}>
              <SelectTrigger id="lead">
                <SelectValue placeholder="Select Lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.company} ({l.contact})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={(val) => setMethod(val as any)}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as any)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="time">Date *</Label>
            <Input id="time" type="date" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Discuss sample feedback and quotation revisions" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Scheduling..." : "Schedule Follow-Up"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

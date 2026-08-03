import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmployeeAvatar } from "./employee-avatar";
import { GenericStatusBadge } from "./status-badge";
import { useCRMStore } from "@/lib/crm-store";
import type { FollowUp } from "@/lib/mock-data";
import { Phone, MessageCircle, Mail, Calendar, Check, X, Trash, Edit } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { EditFollowUpModal } from "./edit-followup-modal";

const methodIcon = {
  Call: Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
  Meeting: Calendar,
};

export function FollowUpCard({ item }: { item: FollowUp }) {
  const { deleteFollowUp } = useCRMStore();
  const Icon = methodIcon[item.method];
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this follow-up?")) {
      try {
        await deleteFollowUp(item.id);
        toast.success("Follow-up deleted successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete follow-up");
      }
    }
  };

  return (
    <>
      <Card className="rounded-2xl border border-border/60 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon className="h-4 w-4 text-primary" />
              <span className="truncate">{item.company}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {item.contact} · {new Date(item.time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {item.notes && <p className="mt-2 text-xs text-foreground/80">{item.notes}</p>}
          </div>
          <GenericStatusBadge status={item.status} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <EmployeeAvatar employeeId={item.ownerId} showName size="sm" />
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-8 gap-1"><Check className="h-3.5 w-3.5" /> Done</Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1"><X className="h-3.5 w-3.5" /> Skip</Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditOpen(true)}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDelete}><Trash className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
      </Card>
      <EditFollowUpModal open={editOpen} onOpenChange={setEditOpen} followUp={item} />
    </>
  );
}
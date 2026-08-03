import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/mock-data";

const styles: Record<LeadStatus, string> = {
  New: "bg-sky-100 text-sky-800 border-sky-200",
  Contacted: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Interested: "bg-violet-100 text-violet-800 border-violet-200",
  "Quotation Sent": "bg-amber-100 text-amber-900 border-amber-200",
  Negotiation: "bg-orange-100 text-orange-900 border-orange-200",
  "Sample Requested": "bg-teal-100 text-teal-900 border-teal-200",
  Won: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Lost: "bg-rose-100 text-rose-900 border-rose-200",
};

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", styles[status], className)}>
      {status}
    </Badge>
  );
}

const genericStyles: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-800 border-slate-200",
  Sent: "bg-sky-100 text-sky-800 border-sky-200",
  Viewed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Accepted: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Rejected: "bg-rose-100 text-rose-900 border-rose-200",
  Processing: "bg-amber-100 text-amber-900 border-amber-200",
  Packed: "bg-sky-100 text-sky-800 border-sky-200",
  Shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Delivered: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Pending: "bg-amber-100 text-amber-900 border-amber-200",
  Done: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Overdue: "bg-rose-100 text-rose-900 border-rose-200",
  Active: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-700 border-slate-200",
  "To Do": "bg-slate-100 text-slate-800 border-slate-200",
  "In Progress": "bg-sky-100 text-sky-800 border-sky-200",
  Completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

export function GenericStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", genericStyles[status] ?? "", className)}>
      {status}
    </Badge>
  );
}
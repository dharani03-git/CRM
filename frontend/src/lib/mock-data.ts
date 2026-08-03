export type Role = "super_admin" | "sales_manager" | "sales_executive";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Quotation Sent"
  | "Negotiation"
  | "Sample Requested"
  | "Won"
  | "Lost";

export type Priority = "Low" | "Medium" | "High";

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Quotation Sent",
  "Negotiation",
  "Sample Requested",
  "Won",
  "Lost",
];

export interface Employee {
  id: string;
  name: string;
  role: Role;
  department: string;
  manager?: string;
  status: "Active" | "Inactive";
  target: number;
  achieved: number;
  email: string;
  phone: string;
}

export const products = [
  "Coconut Shell Bowls",
  "Banana Fibre Baskets",
  "Terracotta Planters",
  "Eco Gift Boxes",
  "Palm Leaf Plates",
  "Jute Tote Bags",
  "Neem Wood Cutlery",
  "Handmade Diyas",
];

export const leadSources = [
  "Website",
  "Referral",
  "LinkedIn",
  "Trade Show",
  "Cold Call",
  "Instagram",
  "Email Campaign",
];

export const categories = [
  "Corporate Gifting",
  "Wedding Favours",
  "Retail Distribution",
  "Export",
  "Event",
];

export interface AssignmentEvent {
  by: string;
  to: string;
  date: string;
  note?: string;
}

export interface ActivityEvent {
  id: string;
  type: "call" | "email" | "whatsapp" | "meeting" | "note" | "assignment" | "status";
  actor: string;
  timestamp: string;
  summary: string;
}

export interface Lead {
  id: string;
  company: string;
  contact: string;
  designation: string;
  mobile: string;
  email: string;
  source: string;
  category: string;
  priority: Priority;
  ownerId: string;
  status: LeadStatus;
  nextFollowUp: string;
  lastActivity: string;
  city: string;
  productInterests: string[];
  estimatedValue: number;
  notes: string;
  contacted: boolean;
  assignmentHistory: AssignmentEvent[];
  activity: ActivityEvent[];
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  company: string;
  contact: string;
  time: string;
  method: "Call" | "WhatsApp" | "Email" | "Meeting";
  ownerId: string;
  status: "Pending" | "Done" | "Overdue";
  notes?: string;
}

export type TaskStatus = "To Do" | "In Progress" | "Completed";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string;
  leadId?: string;
  assigneeId: string;
  status: TaskStatus;
}

export type QuotationStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected";

export interface QuotationLine {
  product: string;
  qty: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  leadId: string;
  company: string;
  createdAt: string;
  status: QuotationStatus;
  ownerId: string;
  lines: QuotationLine[];
  discountPct: number;
  taxPct: number;
  notes?: string;
}

export function quoteTotals(q: Quotation) {
  const subtotal = q.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const discount = (subtotal * q.discountPct) / 100;
  const taxable = subtotal - discount;
  const tax = (taxable * q.taxPct) / 100;
  const total = taxable + tax;
  return { subtotal, discount, tax, total };
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// Retain empty placeholders to avoid syntax import failures
export const employees: Employee[] = [];
export const leads: Lead[] = [];
export const followUps: FollowUp[] = [];
export const tasks: Task[] = [];
export const quotations: Quotation[] = [];
export const customers: any[] = [];
export const orders: any[] = [];
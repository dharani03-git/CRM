import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Lead, Employee, Task, FollowUp, Quotation, LeadStatus, Priority, ActivityEvent, AssignmentEvent } from "./mock-data";
import { api, getAuthToken } from "./api";
import { useRole } from "./role-context";

// Default seed employees to ensure RoleProvider and role-switching features work
const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Administrator",
    role: "super_admin",
    department: "Operations",
    status: "Active",
    target: 0,
    achieved: 0,
    email: "admin@kottravai.in",
    phone: "+91 90000 10101",
  },
];

interface CRMStoreContextType {
  leads: Lead[];
  employees: Employee[];
  tasks: Task[];
  followUps: FollowUp[];
  quotations: Quotation[];
  customers: Array<{
    id: string;
    company: string;
    contact: string;
    city: string;
    email: string;
    mobile: string;
    lifetimeValue: number;
    ownerId: string;
  }>;
  orders: Array<{
    id: string;
    customerId: string;
    company: string;
    amount: number;
    status: "Processing" | "Packed" | "Shipped" | "Delivered";
    date: string;
  }>;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "lastActivity" | "activity" | "assignmentHistory"> & { note?: string }, currentUser: { name: string }) => void;
  addEmployee: (employee: Omit<Employee, "id" | "achieved">) => void;
  addTask: (task: Omit<Task, "id">) => void;
  addFollowUp: (followUp: Omit<FollowUp, "id">) => void;
  addQuotation: (quotation: Omit<Quotation, "id" | "createdAt" | "status">) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, currentUser: { name: string }) => void;
  updateLeadOwner: (leadId: string, ownerId: string, note: string, currentUser: { name: string }) => void;
  addLeadActivity: (leadId: string, activity: Omit<ActivityEvent, "id" | "timestamp"> & { actor: string }) => void;
  editLead: (leadId: string, leadData: Partial<Lead>) => Promise<any>;
  deleteLead: (leadId: string) => Promise<void>;
  deleteFollowUp: (followUpId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  editEmployee: (employeeId: string, employeeData: Partial<Employee>) => Promise<any>;
  editTask: (taskId: string, taskData: Partial<Task>) => Promise<any>;
  editFollowUp: (followUpId: string, followUpData: Partial<FollowUp>) => Promise<any>;
}

const CRMStoreContext = createContext<CRMStoreContextType | null>(null);

export function CRMStoreProvider({ children }: { children: ReactNode }) {
  const { role, currentUser } = useRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Function to load all data from backend
  const loadAllData = async () => {
    if (!getAuthToken()) return;
    try {
      const [emps, lds, fus, tks, qts] = await Promise.all([
        api.getEmployees(),
        api.getLeads(),
        api.getFollowUps(),
        api.getTasks(),
        api.getQuotations(),
      ]);
      setEmployees(emps);
      setLeads(lds);
      setFollowUps(fus);
      setTasks(tks);
      setQuotations(qts);
    } catch (err: any) {
      console.error("Failed to fetch CRM data from backend:", err);
      if (err.message && err.message.includes("User not found")) {
        setAuthToken(null);
        window.location.reload();
      }
    }
  };

  // Load on mount and on auth change
  useEffect(() => {
    loadAllData();
    window.addEventListener("crm-auth-change", loadAllData);
    return () => window.removeEventListener("crm-auth-change", loadAllData);
  }, []);

  // Helper selectors filtered by role
  const filteredLeads = React.useMemo(() => {
    if (role === "sales_executive") {
      return leads.filter((l) => l.ownerId === currentUser.id);
    }
    return leads;
  }, [leads, role, currentUser.id]);

  const filteredFollowUps = React.useMemo(() => {
    if (role === "sales_executive") {
      return followUps.filter((f) => f.ownerId === currentUser.id);
    }
    return followUps;
  }, [followUps, role, currentUser.id]);

  const filteredTasks = React.useMemo(() => {
    if (role === "sales_executive") {
      return tasks.filter((t) => t.assignedTo === currentUser.id);
    }
    return tasks;
  }, [tasks, role, currentUser.id]);

  const customers = React.useMemo(() => {
    return filteredLeads
      .filter((l) => l.status === "Won")
      .map((l, i) => ({
        id: `CU-${7000 + i + 1}`,
        company: l.company,
        contact: l.contact,
        city: l.city,
        email: l.email,
        mobile: l.mobile,
        lifetimeValue: l.estimatedValue,
        ownerId: l.ownerId,
      }));
  }, [filteredLeads]);

  const orders = React.useMemo(() => {
    return customers.map((c, i) => ({
      id: `OR-${8000 + i + 1}`,
      customerId: c.id,
      company: c.company,
      amount: c.lifetimeValue,
      status: "Processing" as const,
      date: new Date().toISOString().split("T")[0],
    }));
  }, [customers]);

  // Mutators
  const addLead = async (
    leadData: Omit<Lead, "id" | "createdAt" | "lastActivity" | "activity" | "assignmentHistory"> & { note?: string },
    currentUser: { name: string }
  ) => {
    try {
      const res = await api.createLead(leadData);
      setLeads((prev) => [res, ...prev]);
      return res;
    } catch (err) {
      console.error("Failed to create lead:", err);
      throw err;
    }
  };

  const addEmployee = async (empData: Omit<Employee, "id" | "achieved">) => {
    try {
      const res = await api.createEmployee({ ...empData, password: "password123" });
      setEmployees((prev) => [...prev, res]);
      return res;
    } catch (err) {
      console.error("Failed to create employee:", err);
      throw err;
    }
  };

  const addTask = async (taskData: Omit<Task, "id">) => {
    try {
      const res = await api.createTask(taskData);
      setTasks((prev) => [res, ...prev]);
      return res;
    } catch (err) {
      console.error("Failed to create task:", err);
      throw err;
    }
  };

  const addFollowUp = async (fuData: Omit<FollowUp, "id">) => {
    try {
      const res = await api.createFollowUp(fuData);
      setFollowUps((prev) => [res, ...prev]);
      return res;
    } catch (err) {
      console.error("Failed to create follow-up:", err);
      throw err;
    }
  };

  const addQuotation = async (qData: Omit<Quotation, "id" | "createdAt" | "status">) => {
    try {
      const res = await api.createQuotation(qData);
      setQuotations((prev) => [res, ...prev]);
      return res;
    } catch (err) {
      console.error("Failed to create quotation:", err);
      throw err;
    }
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, currentUser: { name: string }) => {
    try {
      const res = await api.updateLead(leadId, { status });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res : l)));
      return res;
    } catch (err) {
      console.error("Failed to update lead status:", err);
      throw err;
    }
  };

  const updateLeadOwner = async (leadId: string, ownerId: string, note: string, currentUser: { name: string }) => {
    try {
      const res = await api.updateLead(leadId, { ownerId, notes: note });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res : l)));
      return res;
    } catch (err) {
      console.error("Failed to update lead owner:", err);
      throw err;
    }
  };

  const addLeadActivity = async (leadId: string, actData: Omit<ActivityEvent, "id" | "timestamp"> & { actor: string }) => {
    try {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;
      
      const newActivity = {
        ...actData,
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      const updatedActivity = [newActivity, ...lead.activity];
      
      const res = await api.updateLead(leadId, { activity: updatedActivity });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res : l)));
      return res;
    } catch (err) {
      console.error("Failed to add activity:", err);
      throw err;
    }
  };

  const editLead = async (leadId: string, leadData: Partial<Lead>) => {
    try {
      const res = await api.updateLead(leadId, leadData);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res : l)));
      return res;
    } catch (err) {
      console.error("Failed to update lead:", err);
      throw err;
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      await api.deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (err) {
      console.error("Failed to delete lead:", err);
      throw err;
    }
  };

  const deleteFollowUp = async (followUpId: string) => {
    try {
      await api.deleteFollowUp(followUpId);
      setFollowUps((prev) => prev.filter((f) => f.id !== followUpId));
    } catch (err) {
      console.error("Failed to delete follow up:", err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
      throw err;
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      await api.deleteEmployee(employeeId);
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    } catch (err) {
      console.error("Failed to delete employee:", err);
      throw err;
    }
  };

  const editEmployee = async (employeeId: string, employeeData: Partial<Employee>) => {
    try {
      const res = await api.updateEmployee(employeeId, employeeData);
      setEmployees((prev) => prev.map((e) => (e.id === employeeId ? res : e)));
      return res;
    } catch (err) {
      console.error("Failed to edit employee:", err);
      throw err;
    }
  };

  const editTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const res = await api.updateTask(taskId, taskData);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res : t)));
      return res;
    } catch (err) {
      console.error("Failed to edit task:", err);
      throw err;
    }
  };

  const editFollowUp = async (followUpId: string, followUpData: Partial<FollowUp>) => {
    try {
      const res = await api.updateFollowUp(followUpId, followUpData);
      setFollowUps((prev) => prev.map((f) => (f.id === followUpId ? res : f)));
      return res;
    } catch (err) {
      console.error("Failed to edit follow-up:", err);
      throw err;
    }
  };

  return (
    <CRMStoreContext.Provider
      value={{
        leads: filteredLeads,
        employees,
        tasks: filteredTasks,
        followUps: filteredFollowUps,
        quotations,
        customers,
        orders,
        addLead,
        addEmployee,
        addTask,
        addFollowUp,
        addQuotation,
        updateLeadStatus,
        updateLeadOwner,
        addLeadActivity,
        editLead,
        deleteLead,
        deleteFollowUp,
        deleteTask,
        deleteEmployee,
        editEmployee,
        editTask,
        editFollowUp,
      }}
    >
      {children}
    </CRMStoreContext.Provider>
  );
}

export function useCRMStore() {
  const context = useContext(CRMStoreContext);
  if (!context) {
    throw new Error("useCRMStore must be used within a CRMStoreProvider");
  }
  return context;
}

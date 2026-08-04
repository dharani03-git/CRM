import { useState } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { type Role } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function AddEmployeeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addEmployee, employees } = useCRMStore();

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("sales_executive");
  const [department, setDepartment] = useState("");
  const [manager, setManager] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [target, setTarget] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const managers = employees.filter((e) => e.role === "sales_manager" || e.role === "super_admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department || !email || !phone) {
      toast.error("Please fill in all required fields (Name, Department, Email, Phone)");
      return;
    }

    setLoading(true);
    try {
      await addEmployee({
        name,
        role,
        department,
        manager: manager === "none" || !manager ? undefined : manager,
        status,
        target: Number(target) || 0,
        email,
        phone,
      });

      toast.success("Employee added successfully!");
      onOpenChange(false);

      // Reset Form
      setName("");
      setRole("sales_executive");
      setDepartment("");
      setManager("");
      setStatus("Active");
      setTarget("");
      setEmail("");
      setPhone("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" required disabled={loading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as Role)} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="sales_manager">Sales Manager</SelectItem>
                  <SelectItem value="sales_executive">Sales Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "Active" | "Inactive")} disabled={loading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="department">Department *</Label>
              <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Corporate Sales" required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manager">Reporting Manager</Label>
              <Select value={manager} onValueChange={setManager} disabled={loading}>
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {managers.map((m) => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. ramesh@kottravai.in" required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98407 55667" required disabled={loading} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="target">Monthly Sales Target (INR)</Label>
            <Input id="target" type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 500000" disabled={loading} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Employee"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

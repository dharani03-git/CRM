import { useState, useEffect } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { type Employee, type Role } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface EditEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmployeeModal({ employee, open, onOpenChange }: EditEmployeeModalProps) {
  const { editEmployee, employees } = useCRMStore();

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("sales_executive");
  const [department, setDepartment] = useState("");
  const [manager, setManager] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [target, setTarget] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-populate fields when employee changes
  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRole(employee.role);
      setDepartment(employee.department);
      setManager(employee.manager || "");
      setStatus(employee.status);
      setTarget(employee.target ? String(employee.target) : "");
      setPhone(employee.phone || "");
    }
  }, [employee]);

  const managers = employees.filter((e) => (e.role === "sales_manager" || e.role === "super_admin") && e.id !== employee?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (!name || !department || !phone) {
      toast.error("Please fill in all required fields (Name, Department, Phone)");
      return;
    }

    setLoading(true);
    try {
      await editEmployee(employee.id, {
        name,
        role,
        department,
        managerName: manager === "none" || !manager ? undefined : manager,
        status,
        target: Number(target) || 0,
        phone,
      });

      toast.success("Employee updated successfully!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Employee Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as Role)} disabled={loading}>
                <SelectTrigger id="edit-role">
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
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "Active" | "Inactive")} disabled={loading}>
                <SelectTrigger id="edit-status">
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
              <Label htmlFor="edit-department">Department *</Label>
              <Input id="edit-department" value={department} onChange={(e) => setDepartment(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-manager">Reporting Manager</Label>
              <Select value={manager} onValueChange={setManager} disabled={loading}>
                <SelectTrigger id="edit-manager">
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
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" type="email" value={employee?.email || ""} disabled={true} className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-target">Monthly Sales Target (INR)</Label>
            <Input id="edit-target" type="number" value={target} onChange={(e) => setTarget(e.target.value)} disabled={loading} />
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

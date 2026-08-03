import { useState, useEffect } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { type Priority, type TaskStatus, type Task } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function EditTaskModal({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}) {
  const { editTask, employees, leads } = useCRMStore();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [leadId, setLeadId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState<TaskStatus>("To Do");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setPriority(task.priority || "Medium");
      setLeadId(task.leadId || "none");
      setAssigneeId(task.assigneeId || "");
      setStatus(task.status || "To Do");

      if (task.dueDate) {
        const dateObj = new Date(task.dueDate);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        setDueDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setDueDate("");
      }
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !assigneeId) {
      toast.error("Please fill in all required fields (Task Title, Due Date, and Assignee)");
      return;
    }

    setLoading(true);
    try {
      await editTask(task.id, {
        title,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        leadId: leadId === "none" ? undefined : leadId || undefined,
        assigneeId,
        status,
      });

      toast.success("Task updated successfully!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="title">Task Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)} disabled={loading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="assignee">Assignee *</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId} disabled={loading}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="lead">Associated Lead (Optional)</Label>
            <Select value={leadId} onValueChange={setLeadId} disabled={loading}>
              <SelectTrigger id="lead">
                <SelectValue placeholder="Select Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.company} ({l.contact})</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

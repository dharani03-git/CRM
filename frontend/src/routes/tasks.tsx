import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { PriorityBadge } from "@/components/crm/priority-badge";
import { EmployeeAvatar } from "@/components/crm/employee-avatar";
import { AddTaskModal } from "@/components/crm/add-task-modal";
import { EditTaskModal } from "@/components/crm/edit-task-modal";
import { useCRMStore } from "@/lib/crm-store";
import { type TaskStatus, type Task } from "@/lib/mock-data";
import { Plus, Calendar, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Kottravai CRM" },
      { name: "description", content: "Kanban board for internal tasks tied to leads." },
      { property: "og:title", content: "Tasks — Kottravai CRM" },
      { property: "og:description", content: "Manage the sales team's daily tasks." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks, employees, leads, deleteTask } = useCRMStore();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const columns: TaskStatus[] = ["To Do", "In Progress", "Completed"];
  const accent: Record<TaskStatus, string> = {
    "To Do": "bg-slate-400",
    "In Progress": "bg-sky-500",
    Completed: "bg-emerald-500",
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        toast.success("Task deleted successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete task");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks assigned across the team</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <KanbanBoard
        columns={columns.map((c) => ({
          key: c,
          title: c,
          accent: accent[c],
          items: tasks.filter((t) => t.status === c),
        }))}
        renderCard={(t) => {
          const lead = leads.find((l) => l.id === t.leadId);
          return (
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <PriorityBadge priority={t.priority} />
              </div>
              {lead && <p className="mt-1 text-xs text-muted-foreground truncate">Lead: {lead.company}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {new Date(t.dueDate).toLocaleDateString("en-IN")}
                </span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedTask(t); setEditOpen(true); }}><Edit className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDeleteTask(t.id)}><Trash className="h-3.5 w-3.5 text-destructive" /></Button>
                  <EmployeeAvatar employeeId={t.assigneeId} />
                </div>
              </div>
            </div>
          );
        }}
      />

      <AddTaskModal open={open} onOpenChange={setOpen} />
      {selectedTask && (
        <EditTaskModal open={editOpen} onOpenChange={setEditOpen} task={selectedTask} />
      )}
    </div>
  );
}
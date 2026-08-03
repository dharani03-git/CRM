import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCRMStore } from "@/lib/crm-store";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EmployeeAvatar({
  employeeId,
  name,
  size = "sm",
  showName = false,
  className,
}: {
  employeeId?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}) {
  const { employees } = useCRMStore();
  const emp = employeeId ? employees.find((e) => e.id === employeeId) : undefined;
  const displayName = name ?? emp?.name ?? "Unassigned";
  const dims = size === "lg" ? "h-10 w-10 text-sm" : size === "md" ? "h-8 w-8 text-xs" : "h-7 w-7 text-[10px]";
  
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Avatar className={cn(dims, "ring-1 ring-border")}>
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {initials(displayName)}
        </AvatarFallback>
      </Avatar>
      {showName && <span className="text-sm font-medium truncate">{displayName}</span>}
    </div>
  );
}
import { Link, useRouterState } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeAvatar } from "@/components/crm/employee-avatar";
import { useRole, roleLabels } from "@/lib/role-context";
import type { Role } from "@/lib/mock-data";
import { useEffect, useState } from "react";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/follow-ups": "Follow-ups",
  "/tasks": "Tasks",
  "/quotations": "Quotations",
  "/customers": "Customers",
  "/orders": "Orders",
  "/employees": "Employees",
  "/reports": "Reports",
  "/settings": "Settings",
};

function useTitle() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const seg = "/" + (pathname.split("/")[1] ?? "");
  return { pathname, title: routeTitles[seg] ?? "Dashboard" };
}

export function AppHeader() {
  const { title, pathname } = useTitle();
  const { role, setRole, currentUser, logout } = useRole();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="hidden sm:block min-w-0">
            <p className="text-xs text-muted-foreground">Kottravai CRM</p>
            <h1 className="truncate text-lg font-bold text-foreground">{title}</h1>
          </div>
        </div>
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search leads, customers, quotations..." className="w-full pl-9" />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border px-1 py-1 hover:bg-muted">
                <EmployeeAvatar name={currentUser.name} size="md" />
                <span className="hidden sm:block pr-2 text-sm font-medium truncate max-w-[120px]">
                  {currentUser.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{roleLabels[role]}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Switch role</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as Role)}>
                <DropdownMenuRadioItem value="super_admin">Super Admin</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="sales_manager">Sales Manager</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="sales_executive">Sales Executive</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        {pathname !== "/" && (
          <>
            <span>/</span>
            <span className="text-foreground">{title}</span>
          </>
        )}
      </nav>
    </header>
  );
}
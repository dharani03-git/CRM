import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import type { Role } from "./mock-data";
import { api, getAuthToken, setAuthToken } from "./api";

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
  currentUser: { id: string; name: string };
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<RoleCtx | null>(null);

const defaultEmails: Record<Role, string> = {
  sales_executive: "test@kottravai.in",
  sales_manager: "arjun@kottravai.in",
  super_admin: "admin@kottravai.in",
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("sales_executive");
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const u = await api.getCurrentUser();
      if (u) {
        setUser({ id: u.id, name: u.name });
        setRoleState(u.role as Role);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password = "password123") => {
    setLoading(true);
    try {
      await api.login(email, password);
      await fetchCurrentUser();
      window.dispatchEvent(new CustomEvent("crm-auth-change"));
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent("crm-auth-change"));
  };

  // Keep the role-switching convenience for development/testing
  const setRole = async (newRole: Role) => {
    try {
      setLoading(true);
      const email = defaultEmails[newRole] || "admin@kottravai.in";
      await api.login(email, "password123");
      await fetchCurrentUser();
      window.dispatchEvent(new CustomEvent("crm-auth-change"));
    } catch (err) {
      console.error("Failed to switch role:", err);
      setLoading(false);
    }
  };

  const currentUser = useMemo(() => {
    return user || { id: "TEMP", name: "System User" };
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <Ctx.Provider value={{ role, setRole, currentUser, isAuthenticated, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRole() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  sales_manager: "Sales Manager",
  sales_executive: "Sales Executive",
};
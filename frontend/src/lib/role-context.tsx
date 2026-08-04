import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import type { Role } from "./mock-data";
import { api, getAuthToken, setAuthToken } from "./api";
import { supabase } from "./supabaseClient";

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
  sales_executive: "test@gmail.com",
  sales_manager: "arjun@gmail.com",
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
        setRoleState("sales_executive");
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
      setUser(null);
      setRoleState("sales_executive");
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthToken(session.access_token);
        await fetchCurrentUser();
      } else {
        setRoleState("sales_executive");
        setLoading(false);
      }
    };
    initAuth();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setAuthToken(session.access_token);
        await fetchCurrentUser();
        window.dispatchEvent(new CustomEvent("crm-auth-change"));
      } else {
        setAuthToken(null);
        setUser(null);
        setRoleState("sales_executive");
        setLoading(false);
        window.dispatchEvent(new CustomEvent("crm-auth-change"));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthToken(null);
    setUser(null);
    setRoleState("sales_executive");
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
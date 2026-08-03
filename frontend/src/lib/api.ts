// Client API module for Kottravai CRM using Supabase directly
import { supabase } from "./supabaseClient";

// Helper to convert snake_case object to camelCase
export function toCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamel);
  }
  if (obj !== null && typeof obj === "object") {
    const n: any = {};
    Object.keys(obj).forEach((k) => {
      const camelK = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      n[camelK] = toCamel(obj[k]);
    });
    return n;
  }
  return obj;
}

// Helper to convert camelCase object to snake_case
export function toSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnake);
  }
  if (obj !== null && typeof obj === "object") {
    const n: any = {};
    Object.keys(obj).forEach((k) => {
      const snakeK = k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      n[snakeK] = toSnake(obj[k]);
    });
    return n;
  }
  return obj;
}

// Get active JWT token
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("crm_auth_token");
  }
  return null;
}

// Set active JWT token
export function setAuthToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("crm_auth_token", token);
    } else {
      localStorage.removeItem("crm_auth_token");
    }
  }
}

export const api = {
  // Auth
  async login(email: string, password: string = "password123"): Promise<{ accessToken: string }> {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error && error.message.includes("Invalid login credentials")) {
      // Try to auto-signup for dev quick login convenience
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      data = signUpData;
    } else if (error) {
      throw new Error(error.message);
    }

    const token = data.session?.access_token || "";
    setAuthToken(token);

    // Ensure this user exists in the employees profile table
    const { data: authUser } = await supabase.auth.getUser(token);
    if (authUser && authUser.user) {
      const { data: existingEmp } = await supabase
        .from("employees")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!existingEmp) {
        let role = "sales_executive";
        let name = email.split("@")[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        if (email.includes("admin")) {
          role = "super_admin";
        } else if (email.includes("arjun") || email.includes("manager")) {
          role = "sales_manager";
        }

        await supabase.from("employees").insert({
          id: authUser.user.id,
          name,
          email,
          phone: "+91 90000 10101",
          role,
          department: role === "super_admin" ? "Operations" : "Sales",
          status: "Active",
          target: 0.0,
          achieved: 0.0,
        });
      }
    }

    return { accessToken: token };
  },

  async getCurrentUser(): Promise<any> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("User not found");
    }

    const { data: profile, error: profileErr } = await supabase
      .from("employees")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (profileErr || !profile) {
      let role = "sales_executive";
      if (user.email?.includes("admin")) role = "super_admin";
      else if (user.email?.includes("arjun") || user.email?.includes("manager")) role = "sales_manager";

      return {
        id: user.id,
        name: user.email?.split("@")[0] || "User",
        email: user.email,
        role,
        department: "Sales",
        status: "Active",
      };
    }

    return toCamel(profile);
  },

  // Employees
  async getEmployees(): Promise<any[]> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .is("deleted_at", null);

    if (error) throw new Error(error.message);
    return toCamel(data || []);
  },

  async createEmployee(employee: any): Promise<any> {
    const email = employee.email;
    const password = employee.password || "password123";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    const userId = authData?.user?.id || crypto.randomUUID();
    const dbObj = {
      id: userId,
      ...toSnake(employee),
    };
    delete dbObj.password;

    const { data, error } = await supabase
      .from("employees")
      .insert(dbObj)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async updateEmployee(employeeId: string, employee: any): Promise<any> {
    const { data, error } = await supabase
      .from("employees")
      .update(toSnake(employee))
      .eq("id", employeeId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async deleteEmployee(employeeId: string): Promise<any> {
    const { data, error } = await supabase
      .from("employees")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", employeeId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  // Leads
  async getLeads(): Promise<any[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return toCamel(data || []);
  },

  async createLead(lead: any): Promise<any> {
    const cleanLead = { ...lead };
    const firstNote = cleanLead.note || "Lead created and assigned.";
    delete cleanLead.note;

    const dbObj = toSnake(cleanLead);
    const now = new Date().toISOString();

    let actor = "System User";
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        actor = user.email.split("@")[0];
        actor = actor.charAt(0).toUpperCase() + actor.slice(1);
      }
    } catch {}

    dbObj.activity = [
      {
        id: `ACT-${Date.now()}`,
        type: "assignment",
        actor,
        timestamp: now,
        summary: firstNote,
      },
    ];

    dbObj.assignment_history = [
      {
        by: actor,
        to: "Assigned Owner",
        date: now,
        note: "Lead created.",
      },
    ];

    const { data, error } = await supabase
      .from("leads")
      .insert(dbObj)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async updateLead(leadId: string, lead: any): Promise<any> {
    const dbObj = toSnake(lead);
    const { data, error } = await supabase
      .from("leads")
      .update(dbObj)
      .eq("id", leadId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async deleteLead(leadId: string): Promise<any> {
    const { data, error } = await supabase
      .from("leads")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", leadId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  // Follow-ups
  async getFollowUps(): Promise<any[]> {
    const { data, error } = await supabase
      .from("follow_ups")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return toCamel(data || []);
  },

  async createFollowUp(followUp: any): Promise<any> {
    const dbObj = toSnake(followUp);
    const { data, error } = await supabase
      .from("follow_ups")
      .insert(dbObj)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async updateFollowUp(followUpId: string, followUp: any): Promise<any> {
    const dbObj = toSnake(followUp);
    const { data, error } = await supabase
      .from("follow_ups")
      .update(dbObj)
      .eq("id", followUpId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async deleteFollowUp(followUpId: string): Promise<any> {
    const { data, error } = await supabase
      .from("follow_ups")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", followUpId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  // Tasks
  async getTasks(): Promise<any[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return toCamel(data || []);
  },

  async createTask(task: any): Promise<any> {
    const dbObj = toSnake(task);
    const { data, error } = await supabase
      .from("tasks")
      .insert(dbObj)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async updateTask(taskId: string, task: any): Promise<any> {
    const dbObj = toSnake(task);
    const { data, error } = await supabase
      .from("tasks")
      .update(dbObj)
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async deleteTask(taskId: string): Promise<any> {
    const { data, error } = await supabase
      .from("tasks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  // Quotations
  async getQuotations(): Promise<any[]> {
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return toCamel(data || []);
  },

  async createQuotation(quotation: any): Promise<any> {
    const dbObj = toSnake(quotation);
    const { data, error } = await supabase
      .from("quotations")
      .insert(dbObj)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async updateQuotation(quotationId: string, quotation: any): Promise<any> {
    const dbObj = toSnake(quotation);
    const { data, error } = await supabase
      .from("quotations")
      .update(dbObj)
      .eq("id", quotationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },

  async deleteQuotation(quotationId: string): Promise<any> {
    const { data, error } = await supabase
      .from("quotations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", quotationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamel(data);
  },
};

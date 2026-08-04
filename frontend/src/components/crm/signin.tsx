import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, User, Phone, Briefcase, Mail, ShieldAlert, Check, Eye, EyeOff } from "lucide-react";
import { KottravaiLogo } from "../kottravai-logo";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

export function SignIn() {
  const { login } = useRole();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginType, setLoginType] = useState<"employee" | "admin">("employee");

  // Form states
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("sales_executive");
  const [department, setDepartment] = useState("Sales");
  const [rememberMe, setRememberMe] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !emailOrId || !phone || !password || !confirmPassword) {
          throw new Error("Please fill in all required fields.");
        }
        
        // Check email format
        const signUpEmail = emailOrId.trim().toLowerCase();
        if (!signUpEmail.includes("@")) {
          throw new Error("Please enter a valid email address (e.g. name@domain.com) to create an account.");
        }

        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match. Please retype password correctly.");
        }

        // Call api.createEmployee to register both Auth and DB record
        await api.createEmployee({
          name,
          email: signUpEmail,
          phone,
          role,
          department,
          password,
          status: "Active",
          target: 0,
        });

        toast.success("Account created successfully! Logging you in...");
        
        // Log in immediately
        await login(signUpEmail, password);
      } else {
        if (!emailOrId || !password) {
          throw new Error("Please enter your username/email and password.");
        }
        let loginEmail = emailOrId.trim().toLowerCase();
        if (!loginEmail.includes("@")) {
          throw new Error("Please enter a valid email address (e.g. name@email.com).");
        }

        const { data: empProfile } = await supabase
          .from("employees")
          .select("role")
          .eq("email", loginEmail)
          .maybeSingle();
        
        const userRole = empProfile?.role || (loginEmail === "admin@kottravai.in" ? "super_admin" : "sales_executive");

        if (loginType === "admin" && userRole !== "super_admin") {
          throw new Error("This account does not have Admin privileges. Please use Employee Login.");
        }
        if (loginType === "employee" && userRole === "super_admin") {
          throw new Error("Admin accounts must use Admin Login. Please switch tabs.");
        }

        await login(loginEmail, password);
      }
    } catch (err: any) {
      let msg = err.message || "An error occurred. Please try again.";
      if (msg.includes("employees_email_key") || msg.includes("unique constraint")) {
        msg = "An employee account with this email address already exists. Please use a different email or sign in.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmailOrId(quickEmail);
    setPassword("password123");
    setIsSignUp(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8f5f9] via-[#f1e9f3] to-[#e8daed] px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Decorative Gradients */}
      <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-[#8e2a8b]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-[#8e2a8b]/5 blur-[120px] pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl min-h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-white border border-[#8e2a8b]/10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Side: Brand Panel */}
        <div className="relative flex flex-col justify-between p-8 md:p-12 w-full md:w-5/12 bg-gradient-to-br from-[#8e2a8b] via-[#752072] to-[#5a1657] text-white overflow-hidden">
          
          {/* Topographic Map Lines Overlay */}
          <svg className="absolute inset-0 opacity-20 pointer-events-none stroke-purple-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-10,25 Q15,10 40,30 T90,20 T120,40" strokeWidth="0.3"/>
            <path d="M-10,35 Q20,20 50,45 T100,35 T120,55" strokeWidth="0.3"/>
            <path d="M-10,45 Q25,30 60,60 T110,50 T120,70" strokeWidth="0.3"/>
            <path d="M-10,55 Q30,40 70,75 T120,65" strokeWidth="0.3"/>
          </svg>

          {/* Plus signs and circles decorations */}
          <div className="absolute top-10 right-10 opacity-45 text-purple-200 text-lg font-light select-none">+</div>
          <div className="absolute bottom-10 left-10 opacity-45 text-purple-200 text-lg font-light select-none">+</div>
          <div className="absolute top-24 left-10 h-2 w-2 rounded-full border border-purple-200 opacity-30" />
          <div className="absolute bottom-24 right-10 h-3 w-3 rounded-full border border-purple-200 opacity-30" />
          
          {/* Top: Brand Header */}
          <div className="relative flex items-center gap-2.5 z-10">
            <KottravaiLogo className="h-9 w-9 rounded-full border border-purple-400/50 bg-[#5a1657]/50 p-0.5" />
            <div>
              <span className="text-xs font-semibold tracking-wider text-purple-200 uppercase">Kottravai</span>
              <p className="text-[10px] text-purple-300/80 font-medium">Revival of Heritage</p>
            </div>
          </div>

          {/* Middle: Brand Content */}
          <div className="relative my-auto py-12 z-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {isSignUp ? "Join the family" : "Welcome back!"}
            </h2>
            <p className="text-sm text-purple-200/80 leading-relaxed font-medium">
              {isSignUp 
                ? "Create your employee or admin account to start managing leads and corporate gifting quotations." 
                : "You can sign in to access your dashboard with your existing account."}
            </p>
          </div>

          {/* Bottom: Subtitle */}
          <div className="relative z-10 text-[10px] font-bold tracking-wider text-purple-300 uppercase">
            Sustainable CRM Hub © 2026
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="flex flex-col justify-center p-8 md:p-12 w-full md:w-7/12 bg-white">
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {/* Form Title & Switch Option */}
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {isSignUp ? "Create an Account" : "Sign In"}
              </h3>
              <p className="text-xs text-slate-500">
                {isSignUp ? "Already have an account? " : "New here? "}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="font-bold text-[#8e2a8b] hover:underline"
                >
                  {isSignUp ? "Sign In" : "Create an Account"}
                </button>
              </p>
            </div>

            {/* Login Type Tabs (Only shown in Sign In mode to keep clean look) */}
            {!isSignUp && (
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-50 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginType("employee");
                    setError(null);
                    setEmailOrId("");
                    setPassword("");
                  }}
                  className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                    loginType === "employee"
                      ? "bg-white text-[#8e2a8b] shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Employee Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginType("admin");
                    setError(null);
                    setEmailOrId("");
                    setPassword("");
                  }}
                  className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                    loginType === "admin"
                      ? "bg-white text-[#8e2a8b] shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Admin Login
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-medium text-red-700 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Inputs Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUp && (
                <>
                  {/* Name field (SignUp only) */}
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs text-slate-700 font-semibold">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ramesh Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-10 border-slate-200 rounded-xl focus:border-[#8e2a8b] focus:ring-[#8e2a8b]"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Phone field (SignUp only) */}
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs text-slate-700 font-semibold">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="phone"
                        type="text"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-10 border-slate-200 rounded-xl focus:border-[#8e2a8b] focus:ring-[#8e2a8b]"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Role dropdown (SignUp only) */}
                  <div className="space-y-1">
                    <Label htmlFor="role" className="text-xs text-slate-700 font-semibold">Desired Role</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-10 pr-4 h-10 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:border-[#8e2a8b] focus:ring-1 focus:ring-[#8e2a8b]"
                        disabled={loading}
                      >
                        <option value="sales_executive">Sales Executive</option>
                        <option value="sales_manager">Sales Manager</option>
                        <option value="super_admin">Super Admin / Owner</option>
                      </select>
                    </div>
                  </div>

                  {/* Department field (SignUp only) */}
                  <div className="space-y-1">
                    <Label htmlFor="department" className="text-xs text-slate-700 font-semibold">Department</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="department"
                        type="text"
                        placeholder="Sales, Marketing, Operations..."
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="pl-10 h-10 border-slate-200 rounded-xl focus:border-[#8e2a8b] focus:ring-[#8e2a8b]"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email address field */}
              <div className="space-y-1">
                <Label htmlFor="emailOrId" className="text-xs text-slate-700 font-semibold">
                  {isSignUp 
                    ? "Email Address *" 
                    : (loginType === "admin" ? "Admin Email Address *" : "Employee Email Address *")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="emailOrId"
                    type="text"
                    placeholder="e.g. name@email.com"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    className="pl-10 h-10 border-slate-200 rounded-xl focus:border-[#8e2a8b] focus:ring-[#8e2a8b]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs text-slate-700 font-semibold">Password *</Label>
                  {!isSignUp && (
                    <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Choose a strong password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 border-slate-200 rounded-xl focus:border-[#8e2a8b] focus:ring-[#8e2a8b]"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field (SignUp only) */}
              {isSignUp && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="confirmPassword" className="text-xs text-slate-700 font-semibold">Confirm Password *</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Retype your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 border-slate-200 rounded-xl focus:border-[#8e2a8b] focus:ring-[#8e2a8b]"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me (SignIn only) */}
              {!isSignUp && (
                <div className="flex items-center space-x-2 py-1 select-none">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
                      rememberMe 
                        ? "bg-[#8e2a8b] border-[#8e2a8b] text-white" 
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </button>
                  <label 
                    onClick={() => setRememberMe(!rememberMe)} 
                    className="text-xs text-slate-500 font-medium cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 bg-[#8e2a8b] hover:bg-[#a636a3] text-white font-semibold rounded-xl shadow-md shadow-purple-950/10 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

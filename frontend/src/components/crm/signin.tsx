import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Mail, ShieldAlert } from "lucide-react";
import { KottravaiLogo } from "../kottravai-logo";

export function SignIn() {
  const { login } = useRole();
  const [loginType, setLoginType] = useState<"employee" | "admin">("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("password123");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#180a1c] px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decorative Gradients */}
      <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-purple-950/40 blur-[120px] pointer-events-none" />
      <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-fuchsia-950/40 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Logo/Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-800/40 bg-purple-950/50 px-4 py-1.5 text-xs font-medium text-purple-300 backdrop-blur-md">
            <KottravaiLogo className="h-4.5 w-4.5 text-purple-400" />
            Revival of Heritage
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Kottravai <span className="text-purple-400">CRM</span>
          </h1>
          <p className="max-w-xs text-sm text-purple-600/80 dark:text-purple-400/60 font-medium">
            Manage your leads, team permissions, and quotations in one secure hub.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-purple-800/20 bg-purple-950/10 shadow-2xl backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-white text-center">Welcome back</CardTitle>
            <CardDescription className="text-purple-500/70 text-center text-xs">
              Choose your login option below to access the workspace
            </CardDescription>

            {/* Login Type Tabs */}
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-purple-950/50 p-1 border border-purple-900/30">
              <button
                type="button"
                onClick={() => {
                  setLoginType("employee");
                  setEmail("");
                  setError(null);
                }}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${
                  loginType === "employee"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-purple-400/70 hover:text-purple-300 hover:bg-purple-900/20"
                }`}
              >
                Employee Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType("admin");
                  setEmail("");
                  setError(null);
                }}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${
                  loginType === "admin"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-purple-400/70 hover:text-purple-300 hover:bg-purple-900/20"
                }`}
              >
                Admin Login
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-950/40 border border-red-800/30 p-3 text-xs font-medium text-red-300 animate-in fade-in slide-in-from-top-1">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-purple-300/80 font-semibold">
                  {loginType === "admin" ? "Admin Email Address" : "Employee Email Address"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={loginType === "admin" ? "admin@kottravai.in" : "employee@kottravai.in"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-purple-950/20 border-purple-800/30 text-white placeholder-purple-800/50 rounded-2xl focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-purple-300/80 font-semibold">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-purple-950/20 border-purple-800/30 text-white rounded-2xl focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-2xl shadow-lg shadow-purple-950/50 transition-all active:scale-[0.98]"
                disabled={loading || !email}
              >
                {loading ? "Signing in..." : `Sign In as ${loginType === "admin" ? "Admin" : "Employee"}`}
              </Button>
            </form>
          </CardContent>

          {/* Quick Logins for Testing */}
          <CardFooter className="flex flex-col gap-3 border-t border-purple-800/10 bg-purple-950/20 py-4 px-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600/70">
              Quick Dev Access ({loginType === "admin" ? "Admin" : "Employee"} mode)
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {loginType === "admin" ? (
                <button
                  onClick={() => handleQuickLogin("admin@kottravai.in")}
                  className="inline-flex items-center justify-center rounded-xl bg-purple-950/30 border border-purple-800/30 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/40 hover:border-purple-600/50 transition-all"
                >
                  Super Admin
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleQuickLogin("arjun@kottravai.in")}
                    className="inline-flex items-center justify-center rounded-xl bg-purple-950/30 border border-purple-800/30 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/40 hover:border-purple-600/50 transition-all"
                  >
                    Sales Manager
                  </button>
                  <button
                    onClick={() => handleQuickLogin("test@kottravai.in")}
                    className="inline-flex items-center justify-center rounded-xl bg-purple-950/30 border border-purple-800/30 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/40 hover:border-purple-600/50 transition-all"
                  >
                    Sales Exec
                  </button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

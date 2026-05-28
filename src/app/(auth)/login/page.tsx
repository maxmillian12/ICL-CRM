"use client";

import { Suspense, useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { getApiError } from "@/lib/api-client";
import { useRouter, useSearchParams } from "next/navigation";

const REASON_MSGS: Record<string, string> = {
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  TOKEN_INVALID: "Invalid session. Please log in again.",
  auth: "Please log in to continue.",
};

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "";

  const [email, setEmail] = useState("geofrey@integrated.co.tz");
  const [password, setPassword] = useState("555556");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(reason ? (REASON_MSGS[reason] ?? "") : "");

  // Already logged in — go to dashboard
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required"); return; }
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Show spinner while loading auth state (so we don't flash login form to logged-in users)
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img src="/ic-logo.svg" alt="IC" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold">ICL CRM</p>
            <p className="text-muted-foreground text-xs">🇹🇿 Tanzania</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm">Sign in to your ICL workspace</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} autoComplete="email"
              onChange={e => setEmail(e.target.value)} required
              placeholder="you@integrated.co.tz" className="h-10"
              disabled={submitting} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" className="h-10 pr-10" autoComplete="current-password"
                disabled={submitting} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-10" disabled={submitting}>
            {submitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
              : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground font-medium mb-2">🔑 Super Admin credentials:</p>
          <p className="text-xs text-muted-foreground">Email: <span className="text-foreground font-mono">geofrey@integrated.co.tz</span></p>
          <p className="text-xs text-muted-foreground">Password: <span className="text-foreground font-mono">555556</span></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-primary/50 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src="/ic-logo.svg" alt="IC" className="w-12 h-12 rounded-full" />
            <div>
              <p className="text-sidebar-foreground font-bold text-lg">ICL CRM</p>
              <p className="text-sidebar-foreground/50 text-xs">🇹🇿 Tanzania — Agency OS</p>
            </div>
          </div>
          <h1 className="text-sidebar-foreground text-4xl font-bold leading-tight mb-6">
            Run your agency<br />smarter, not harder.
          </h1>
          <p className="text-sidebar-foreground/60 text-lg mb-10">
            The all-in-one platform for managing clients, campaigns, teams, and revenue — built for Integrated Communication Limited.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Currency", value: "TZS" },
              { label: "VAT Rate", value: "18%" },
              { label: "Team Modules", value: "12+" },
              { label: "Compliance", value: "TRA Ready" },
            ].map(s => (
              <div key={s.label} className="bg-sidebar-accent rounded-xl p-4">
                <p className="text-sidebar-foreground text-2xl font-bold">{s.value}</p>
                <p className="text-sidebar-foreground/50 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sidebar-foreground/30 text-sm relative z-10">
          © 2026 Integrated Communication Limited. Dar es Salaam, Tanzania.
        </p>
      </div>

      {/* Right panel — wrapped in Suspense for useSearchParams */}
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center bg-background">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

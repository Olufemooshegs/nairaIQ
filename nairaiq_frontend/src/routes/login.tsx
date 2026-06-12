import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — NairaIQ" }] }),
  component: LoginPage,
});

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.33v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.11z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoginPage() {
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@nairaiq.ng");
  const [password, setPassword] = useState("demo1234");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error("Invalid credentials");
    } finally { setLoading(false); }
  }

  async function onGoogleSignIn() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error("Google sign-in failed. Please try again.");
    } finally { setGoogleLoading(false); }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-hero-gradient">
      <BrandPanel />
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md glass-card p-8 space-y-5 animate-fade-up">
          <div>
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="text-text-muted text-sm mt-1">Sign in to your NairaIQ account</p>
          </div>
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <button disabled={loading} className="w-full rounded-xl bg-mint text-teal-dark font-semibold py-3 hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
          </button>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <button type="button" onClick={onGoogleSignIn} disabled={googleLoading} className="w-full rounded-xl bg-white text-teal-dark font-semibold py-3 hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {googleLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </button>
          <p className="text-center text-sm text-text-muted">
            Don't have an account? <Link to="/register" className="text-mint hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export const inputCls = "w-full rounded-xl bg-teal-overlay/50 border border-border px-4 py-3 text-white placeholder:text-text-muted/60 focus:outline-none focus:border-mint transition";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-text-muted mb-2">{label}</span>
      {children}
    </label>
  );
}

export function BrandPanel() {
  return (
    <div className="hidden md:flex flex-col justify-between p-12 bg-teal-deep border-r border-border">
      <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
        <span className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-teal-dark">₦</span>
        NairaIQ
      </Link>
      <div className="space-y-4">
        <h2 className="font-display text-3xl font-bold">"NairaIQ showed me exactly where my money was leaking. My score jumped from 580 to 780 in 4 months."</h2>
        <p className="text-text-muted">— Chioma O., Lagos</p>
      </div>
      <div className="text-xs text-text-muted">Trusted by 12,000+ Nigerians</div>
    </div>
  );
}

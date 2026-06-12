import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { BrandPanel, Field, inputCls, GoogleIcon } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — NairaIQ" }] }),
  component: RegisterPage,
});

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}

function RegisterPage() {
  const { register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone_number: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pwScore = useMemo(() => strength(form.password), [form.password]);

  async function onGoogleSignUp() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome to NairaIQ!");
      navigate({ to: "/onboarding" });
    } catch (err) {
      toast.error("Google sign-up failed. Please try again.");
    } finally { setGoogleLoading(false); }
  }

  function set<K extends keyof typeof form>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function validatePhone(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length > 11) return "Phone number must be at most 11 digits";
    if (digits.startsWith("0")) {
      if (digits.length !== 11) return "Phone number starting with 0 must be 11 digits";
    } else {
      if (digits.length < 10) return "Phone number must be at least 10 digits";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    if (!agree) return toast.error("Please accept the terms");
    const phoneErr = validatePhone(form.phone_number);
    if (phoneErr) return toast.error(phoneErr);
    setLoading(true);
    try {
      await register({
        email: form.email, password: form.password,
        first_name: form.first_name, last_name: form.last_name,
        phone_number: form.phone_number.startsWith("+") ? form.phone_number : `+234${form.phone_number.replace(/^0/, "")}`,
      });
      toast.success("Account created! Let's build your profile.");
      navigate({ to: "/onboarding" });
    } catch (err) {
      toast.error("Could not create account");
    } finally { setLoading(false); }
  }

  const meterColors = ["#FF6B6B", "#FFB347", "#FFD700", "#8DD9D7", "#4ECDC4"];

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-hero-gradient">
      <BrandPanel />
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md glass-card p-8 space-y-4 animate-fade-up">
          <div>
            <h1 className="font-display text-3xl font-bold">Create your account</h1>
            <p className="text-text-muted text-sm mt-1">Let's find out your NairaIQ Score</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"><input required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className={inputCls} /></Field>
            <Field label="Last name"><input required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Email"><input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></Field>
          <Field label="Phone (+234)">
            <input
              required
              placeholder="8012345678"
              inputMode="numeric"
              maxLength={11}
              value={form.phone_number}
              onChange={(e) => set("phone_number", e.target.value.replace(/\D/g, ""))}
              className={inputCls}
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => set("password", e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 flex gap-1">
              {[0,1,2,3].map((i) => (
                <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < pwScore ? meterColors[pwScore] : "rgba(141,217,215,0.15)" }} />
              ))}
            </div>
          </Field>
          <Field label="Confirm password">
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} required value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <label className="flex items-start gap-2 text-xs text-text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-mint" />
            I agree to the Terms of Service and Privacy Policy.
          </label>
          <button disabled={loading} className="w-full rounded-xl bg-mint text-teal-dark font-semibold py-3 hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Account
          </button>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <button type="button" onClick={onGoogleSignUp} disabled={googleLoading} className="w-full rounded-xl bg-white text-teal-dark font-semibold py-3 hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {googleLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </button>
          <p className="text-center text-sm text-text-muted">
            Already have an account? <Link to="/login" className="text-mint hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

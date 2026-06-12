import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Save, Shield, Bell, CreditCard, Trash2, Check, Eye, EyeOff, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { api, BASE_URL, tokenStore } from "@/lib/api";
import { INCOME_RANGES, RENT_RANGES, DEPENDENT_RANGES } from "@/routes/onboarding";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile & Settings — NairaIQ" }] }),
  component: ProfilePage,
});

type Tab = "personal" | "financial" | "security" | "notifications" | "banks";

const NIGERIAN_BANKS = [
  "Access Bank", "GTBank", "Zenith Bank", "First Bank", "UBA", "Kuda", "Opay", "PalmPay", "Wema Bank", "Stanbic IBTC", "FCMB", "Sterling Bank",
];

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("personal");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "personal", label: "Personal", icon: Camera },
    { id: "financial", label: "Financial", icon: CreditCard },
    { id: "banks", label: "Banks", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const name = user?.first_name || "Tomi";

  return (
    <AppShell title="Profile & Settings" subtitle="Manage your account, preferences, and connected services">
      {/* Header card */}
      <section className="glass-card p-6 flex items-center gap-5 flex-wrap">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-mint text-teal-dark flex items-center justify-center text-3xl font-bold font-display">
            {name[0]?.toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-dark border border-mint/40 text-mint flex items-center justify-center hover:bg-mint hover:text-teal-dark transition">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-bold">{user?.first_name} {user?.last_name}</h2>
          <p className="text-text-muted text-sm">{user?.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 text-mint px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest">
              <Check className="w-3 h-3" /> Verified
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest">
              B+ Tier
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted">Member since</div>
          <div className="text-sm font-semibold">January 2026</div>
        </div>
      </section>

      {/* Tabs */}
      <section className="glass-card p-2 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t.id ? "bg-mint text-teal-dark" : "text-text-muted hover:text-white hover:bg-teal-overlay/40"}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </section>

      {tab === "personal" && <PersonalTab />}
      {tab === "financial" && <FinancialTab />}
      {tab === "banks" && <BanksTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "notifications" && <NotificationsTab />}

      {/* Danger zone */}
      <section className="glass-card p-6 border-danger/30">
        <h3 className="font-display font-semibold text-lg text-danger">Danger zone</h3>
        <p className="text-sm text-text-muted mt-1">Permanently delete your NairaIQ account and all associated data.</p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-danger/40 text-danger px-4 py-2 text-sm hover:bg-danger/10 transition">
          <Trash2 className="w-4 h-4" /> Delete account
        </button>
      </section>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card p-6 space-y-5">
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls = "w-full rounded-lg bg-teal-overlay/40 border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-mint/60 focus:ring-2 focus:ring-mint/20 transition";

function SaveBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-lg bg-mint text-teal-dark px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition">
      <Save className="w-4 h-4" /> Save changes
    </button>
  );
}

function PersonalTab() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [dob, setDob] = useState("");
  const [stateRes, setStateRes] = useState("Lagos");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  async function savePersonal() {
    try {
      const payload: any = {};
      if (firstName) payload.first_name = firstName;
      if (lastName) payload.last_name = lastName;
      if (email) payload.email = email;
      if (phone) payload.phone_number = phone;
      if (dob) payload.date_of_birth = dob;
      if (stateRes) payload.state_of_residence = stateRes;
      await api("/profile/update", { method: "POST", body: JSON.stringify(payload) });
      toast.success("Profile updated");
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === "analytics" || q.queryKey[0] === "dashboard") });
    } catch (e) {
      toast.error("Could not update profile");
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) return toast.error("Select an image first");
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(avatarFile.type)) return toast.error("Only PNG, JPEG or WEBP images allowed");
    if (avatarFile.size > 5 * 1024 * 1024) return toast.error("Image must be <= 5MB");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", avatarFile, avatarFile.name);
      const res = await api<{ avatar_url: string }>("/profile/avatar", { method: "POST", body: fd });
      if (res && (res as any).avatar_url) {
        setAvatarPreview((res as any).avatar_url);
        toast.success("Avatar uploaded");
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === "analytics" || q.queryKey[0] === "dashboard") });
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Section title="Personal information">
      <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col items-start">
            <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Avatar</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-teal-overlay/40 overflow-hidden">
                {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm text-text-muted">No image</div>}
              </div>
              <div className="flex flex-col">
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                <div className="mt-2">
                  <button onClick={uploadAvatar} className="inline-flex items-center gap-2 rounded-lg bg-mint text-teal-dark px-3 py-1 text-sm" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>
                </div>
              </div>
            </div>
          </div>
        <Field label="First name"><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
        <Field label="Last name"><input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
        <Field label="Email"><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Phone"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Field label="Date of birth"><input className={inputCls} type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></Field>
        <Field label="State">
          <select className={inputCls} value={stateRes} onChange={(e) => setStateRes(e.target.value)}>
            {['Lagos', 'Abuja FCT', 'Rivers', 'Kano', 'Oyo', 'Kaduna', 'Enugu', 'Anambra'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div className="flex justify-end">
        <SaveBtn onClick={savePersonal} />
      </div>
    </Section>
  );
}


function FinancialTab() {
  const { user } = useAuth();
  const [incomeRange, setIncomeRange] = useState(INCOME_RANGES[2]);
  const [rentRange, setRentRange] = useState(RENT_RANGES[1]);
  const [dependents, setDependents] = useState(DEPENDENT_RANGES[0]);
  const [source, setSource] = useState("Salary");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [industry, setIndustry] = useState("Technology");
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  async function save() {
    setBusy(true);
    try {
      const payload = {
        monthly_income_range: incomeRange,
        monthly_rent_range: rentRange,
        dependents_range: dependents,
        income_sources: [source],
        employment_status: employmentType,
        industry,
      };
      await api("/profile/update", { method: "POST", body: JSON.stringify(payload) });
      // Refresh analytics/dashboard data
      try {
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === "analytics" || q.queryKey[0] === "dashboard") });
      } catch (e) {
        // ignore
      }
      toast.success("Financial profile updated, score will refresh shortly");
    } catch (err) {
      toast.error("Could not update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Financial profile">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Monthly income (₦)">
          <select className={inputCls} value={incomeRange} onChange={(e) => setIncomeRange(e.target.value)}>
            {INCOME_RANGES.map((r) => <option key={r} value={r}>₦ {r}</option>)}
          </select>
        </Field>
        <Field label="Monthly rent (₦)">
          <select className={inputCls} value={rentRange} onChange={(e) => setRentRange(e.target.value)}>
            {RENT_RANGES.map((r) => <option key={r} value={r}>{r === "No rent" ? r : `₦ ${r}`}</option>)}
          </select>
        </Field>
        <Field label="Number of dependents">
          <select className={inputCls} value={dependents} onChange={(e) => setDependents(e.target.value)}>
            {DEPENDENT_RANGES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Income source">
          <select className={inputCls} value={source} onChange={(e) => setSource(e.target.value)}>
            <option>Salary</option><option>Business</option><option>Freelance</option><option>Mixed</option>
          </select>
        </Field>
        <Field label="Employment type">
          <select className={inputCls} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
            <option>Full-time</option><option>Contract</option><option>Self-employed</option><option>Student</option>
          </select>
        </Field>
        <Field label="Industry">
          <select className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Oil & Gas', 'Government', 'Other'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <p className="text-xs text-text-muted">Your goals, risk appetite and savings targets are calculated automatically by NairaIQ based on this profile.</p>
      <div className="flex justify-end">
        <SaveBtn onClick={save} />
      </div>
    </Section>
  );
}

function BanksTab() {
  return (
    <Section title="Connected banks & wallets">
      <div className="relative min-h-[360px]">
        <div className="pointer-events-none select-none blur-md opacity-60 grid sm:grid-cols-2 gap-3" aria-hidden>
          {NIGERIAN_BANKS.map((b) => (
            <div key={b} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-overlay/40 flex items-center justify-center font-display font-bold text-mint">
                  {b.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{b}</div>
                  <div className="text-xs text-text-muted">Not linked</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card px-8 py-6 text-center border-mint/40">
            <Clock className="w-8 h-8 text-mint mx-auto mb-3" />
            <div className="font-display text-2xl font-bold">Coming Soon</div>
            <p className="text-sm text-text-muted mt-2 max-w-xs">Bank and wallet linking is on the way. You'll be able to connect your accounts here soon.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function SecurityTab() {
  const [show, setShow] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  return (
    <>
      <Section title="Change password">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Current password">
            <div className="relative">
              <input className={inputCls + " pr-10"} type={show ? "text" : "password"} placeholder="••••••••" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-mint">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <Field label="New password"><input className={inputCls} type="password" placeholder="••••••••" /></Field>
        </div>
        <div className="flex justify-end">
          <SaveBtn onClick={() => toast.success("Password updated")} />
        </div>
      </Section>
      <Section title="Two-factor authentication">
        <Toggle label="Require 2FA on every sign-in" sub="We'll send a code to your phone" checked={twoFA} onChange={setTwoFA} />
        <Toggle label="Biometric login (mobile)" sub="Use Face ID or fingerprint on supported devices" checked onChange={() => {}} />
        <Toggle label="Login alerts" sub="Email me on every new device sign-in" checked onChange={() => {}} />
      </Section>
    </>
  );
}

function NotificationsTab() {
  return (
    <Section title="Notification preferences">
      <Toggle label="Weekly score report" sub="Every Monday at 9am" checked onChange={() => {}} />
      <Toggle label="Goal milestone alerts" sub="When you hit a savings target" checked onChange={() => {}} />
      <Toggle label="Spending anomalies" sub="Unusual transactions or category spikes" checked onChange={() => {}} />
      <Toggle label="New insights & tips" checked={false} onChange={() => {}} />
      <Toggle label="Promotional emails" checked={false} onChange={() => {}} />
    </Section>
  );
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center justify-between w-full rounded-xl border border-border bg-teal-overlay/20 p-4 hover:border-mint/30 transition text-left">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
      </div>
      <span className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-mint" : "bg-teal-overlay"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — NairaIQ" }] }),
  component: OnboardingPage,
});

const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
const EMPLOYMENT = ["Employed","Self-Employed","Business Owner","Student","Retired","Unemployed"];
const INCOME_SOURCES = ["Salary","Business","Freelance","Investments","Rental","Remittance","Other"];
const BANKS = ["Access","GTBank","Zenith","First Bank","UBA","Stanbic","Fidelity","FCMB","Polaris","Sterling","Wema","Opay","Kuda","Moniepoint","PalmPay","Other"];

export const INCOME_RANGES = [
  "0 - 50,000",
  "50,000 - 100,000",
  "100,000 - 200,000",
  "200,000 - 350,000",
  "350,000 - 500,000",
  "500,000 - 750,000",
  "750,000 - 1,000,000",
  "1,000,000 and above",
];
export const RENT_RANGES = [
  "No rent",
  "0 - 100,000",
  "100,000 - 300,000",
  "300,000 - 600,000",
  "600,000 - 1,000,000",
  "1,000,000 - 2,000,000",
  "2,000,000 and above",
];
export const DEPENDENT_RANGES = ["0", "1 - 2", "3 - 4", "5 - 6", "7 or more"];

export const EXPENSE_RANGES = [
  "0 - 20,000",
  "20,000 - 50,000",
  "50,000 - 100,000",
  "100,000 - 200,000",
  "200,000 - 400,000",
  "400,000 and above",
];
export const EXPENSE_CATEGORIES = [
  { key: "food", label: "Food & Groceries" },
  { key: "utilities", label: "Utilities & Bills" },
  { key: "transport", label: "Transport & Fuel" },
  { key: "data", label: "Airtime & Data" },
  { key: "entertainment", label: "Entertainment & Eating Out" },
  { key: "healthcare", label: "Healthcare" },
] as const;
type ExpenseKey = (typeof EXPENSE_CATEGORIES)[number]["key"];

function input(extra = "") {
  return `w-full rounded-xl bg-teal-overlay/50 border border-border px-4 py-3 text-white placeholder:text-text-muted/60 focus:outline-none focus:border-mint transition ${extra}`;
}

const TOTAL_STEPS = 3;

function OnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  // Step 1
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Prefer not to say");
  const [state, setState] = useState("Lagos");
  const [occupation, setOccupation] = useState("");
  const [employment, setEmployment] = useState("Employed");

  // Step 2
  const [incomeRange, setIncomeRange] = useState(INCOME_RANGES[2]);
  const [rentRange, setRentRange] = useState(RENT_RANGES[1]);
  const [dependents, setDependents] = useState(DEPENDENT_RANGES[0]);
  const [sources, setSources] = useState<string[]>(["Salary"]);
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>(
    () => Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.key, EXPENSE_RANGES[1]])) as Record<ExpenseKey, string>
  );
  const [bank, setBank] = useState("GTBank");
  const [bvn, setBvn] = useState(false);
  const [nin, setNin] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, isLoading, navigate]);

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function next() {
    setBusy(true);
    try {
      if (step === 1) {
        await api("/onboarding/personal", { method: "POST", body: JSON.stringify({ date_of_birth: dob, gender, state_of_residence: state, occupation, employment_status: employment }) });
      } else if (step === 2) {
        // derive numeric monthly income and expenses from selected ranges
        const parseNumber = (s: string | number | undefined) => {
          if (!s && s !== 0) return 0;
          const str = String(s || "");
          if (/no rent/i.test(str) || /no rent/i.test(str)) return 0;
          // handle "X - Y" ranges
          if (str.includes("-")) {
            const parts = str.split("-").map((p) => p.replace(/[^0-9]/g, "").trim());
            const a = Number(parts[0] || 0);
            const b = Number(parts[1] || 0);
            if (!isNaN(a) && !isNaN(b) && b > 0) return (a + b) / 2;
            return a || b || 0;
          }
          // handle "and above"
          if (/and above/i.test(str)) {
            const n = Number(str.replace(/[^0-9]/g, ""));
            return isNaN(n) ? 0 : n;
          }
          const n = Number(str.replace(/[^0-9]/g, ""));
          return isNaN(n) ? 0 : n;
        };

        const monthly_income = parseNumber(incomeRange);
        const monthly_expenses = Object.values(expenses).reduce((acc, r) => acc + parseNumber(r), 0);

        await api("/onboarding/financial", { method: "POST", body: JSON.stringify({
          monthly_income_range: incomeRange,
          monthly_rent_range: rentRange,
          dependents_range: dependents,
          income_sources: sources,
          monthly_expenses_by_category: expenses,
          // numeric values used by backend engines
          monthly_income,
          monthly_expenses,
          primary_bank: bank,
          has_bvn: bvn,
          bvn_verified: bvn,
          has_nin: nin,
        }) });
      } else if (step === 3) {
        await api("/onboarding/complete", { method: "POST" });
        toast.success("Your NairaIQ Score is ready! 🚀");
        navigate({ to: "/dashboard" });
        return;
      }
      setStep((s) => s + 1);
    } catch { toast.error("Could not save, try again"); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-hero-gradient text-white">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="w-7 h-7 rounded-lg bg-mint flex items-center justify-center text-teal-dark text-sm">₦</span>
            NairaIQ
          </Link>
          <span className="text-xs text-text-muted">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-1 bg-teal-overlay/50">
          <div className="h-full bg-mint transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div key={step} className="glass-card p-8 animate-fade-up">
          {step === 1 && (
            <>
              <H title="Tell us about you" sub="A few details to personalize your experience." />
              <div className="space-y-5">
                <Row label="Date of birth"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={input()} required /></Row>
                <Row label="Gender">
                  <div className="flex flex-wrap gap-2">
                    {["Male","Female","Prefer not to say"].map((g) => (
                      <Chip key={g} active={gender === g} onClick={() => setGender(g)}>{g}</Chip>
                    ))}
                  </div>
                </Row>
                <Row label="State of residence">
                  <select value={state} onChange={(e) => setState(e.target.value)} className={input()}>
                    {STATES.map((s) => <option key={s} value={s} className="bg-teal-deep">{s}</option>)}
                  </select>
                </Row>
                <Row label="Occupation"><input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Software Engineer" className={input()} /></Row>
                <Row label="Employment status">
                  <select value={employment} onChange={(e) => setEmployment(e.target.value)} className={input()}>
                    {EMPLOYMENT.map((e) => <option key={e} value={e} className="bg-teal-deep">{e}</option>)}
                  </select>
                </Row>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <H title="Your financial profile" sub="We use this to calculate your NairaIQ Score." />
              <div className="space-y-5">
                <Row label="Monthly income (₦)">
                  <select value={incomeRange} onChange={(e) => setIncomeRange(e.target.value)} className={input()}>
                    {INCOME_RANGES.map((r) => <option key={r} value={r} className="bg-teal-deep">₦ {r}</option>)}
                  </select>
                </Row>
                <Row label="Monthly rent (₦)">
                  <select value={rentRange} onChange={(e) => setRentRange(e.target.value)} className={input()}>
                    {RENT_RANGES.map((r) => <option key={r} value={r} className="bg-teal-deep">{r === "No rent" ? r : `₦ ${r}`}</option>)}
                  </select>
                </Row>
                <Row label="Number of dependents">
                  <div className="flex flex-wrap gap-2">
                    {DEPENDENT_RANGES.map((d) => (
                      <Chip key={d} active={dependents === d} onClick={() => setDependents(d)}>{d}</Chip>
                    ))}
                  </div>
                </Row>
                <Row label="Income sources">
                  <div className="flex flex-wrap gap-2">
                    {INCOME_SOURCES.map((s) => (
                      <Chip key={s} active={sources.includes(s)} onClick={() => toggle(sources, s, setSources)}>{s}</Chip>
                    ))}
                  </div>
                </Row>
                <Row label="Monthly spending by category (₦)">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {EXPENSE_CATEGORIES.map((c) => (
                      <label key={c.key} className="block">
                        <span className="text-[11px] text-text-muted">{c.label}</span>
                        <select
                          value={expenses[c.key]}
                          onChange={(e) => setExpenses((prev) => ({ ...prev, [c.key]: e.target.value }))}
                          className={input("mt-1 py-2 text-sm")}
                        >
                          {EXPENSE_RANGES.map((r) => <option key={r} value={r} className="bg-teal-deep">₦ {r}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </Row>
                <Row label="Primary bank">
                  <select value={bank} onChange={(e) => setBank(e.target.value)} className={input()}>
                    {BANKS.map((b) => <option key={b} value={b} className="bg-teal-deep">{b}</option>)}
                  </select>
                </Row>
                <Toggle label="BVN verified" value={bvn} onChange={setBvn} />
                <Toggle label="NIN available" value={nin} onChange={setNin} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <H title="Review & complete" sub="Everything look good?" />
              <div className="space-y-3 text-sm">
                <Summary k="State" v={state} />
                <Summary k="Employment" v={employment} />
                <Summary k="Monthly income" v={`₦ ${incomeRange}`} />
                <Summary k="Monthly rent" v={rentRange === "No rent" ? rentRange : `₦ ${rentRange}`} />
                <Summary k="Dependents" v={dependents} />
                <Summary k="Primary bank" v={bank} />
                <Summary k="Income sources" v={sources.join(", ") || "None"} />
              </div>
              <p className="mt-6 text-xs text-text-muted">Your goals, risk profile and savings targets are calculated automatically from your financial profile.</p>
            </>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button type="button" disabled={step === 1 || busy} onClick={() => setStep((s) => Math.max(1, s - 1))} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white disabled:opacity-40">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button type="button" disabled={busy} onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-mint text-teal-dark font-semibold px-6 py-3 hover:opacity-90 disabled:opacity-60">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === TOTAL_STEPS ? "Complete My Profile" : "Next"}
              {!busy && step < TOTAL_STEPS && <ArrowRight className="w-4 h-4" />}
              {step === TOTAL_STEPS && !busy && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function H({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
      <p className="text-text-muted text-sm mt-1">{sub}</p>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-text-muted mb-2">{label}</label>
      {children}
    </div>
  );
}
function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`px-4 py-2 rounded-full text-sm border transition ${active ? "bg-mint text-teal-dark border-mint" : "border-border text-text-body hover:border-mint/60"}`}>
      {children}
    </button>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!value)} className={`relative w-12 h-7 rounded-full transition ${value ? "bg-mint" : "bg-teal-overlay/70"}`}>
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${value ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}
function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2">
      <span className="text-text-muted">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Download, ArrowUpRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/api";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History & Trends — NairaIQ" }] }),
  component: HistoryPage,
});

type Range = "1M" | "3M" | "6M" | "1Y" | "ALL";
const RANGES: { id: Range; label: string; months: number }[] = [
  { id: "1M", label: "1M", months: 1 },
  { id: "3M", label: "3M", months: 3 },
  { id: "6M", label: "6M", months: 6 },
  { id: "1Y", label: "1Y", months: 12 },
  { id: "ALL", label: "All", months: 24 },
];

type Metric = "score" | "savings" | "income" | "expenses";
const METRICS: { id: Metric; label: string; color: string; format: (n: number) => string }[] = [
  { id: "score", label: "NairaIQ Score", color: "#8DD9D7", format: (n) => n.toFixed(0) },
  { id: "savings", label: "Savings Rate", color: "#4ECDC4", format: (n) => `${n.toFixed(1)}%` },
  { id: "income", label: "Monthly Income", color: "#FFB347", format: formatNaira },
  { id: "expenses", label: "Monthly Expenses", color: "#FF6B6B", format: formatNaira },
];

function generateSeries(months: number) {
  const out: { month: string; date: string; score: number; savings: number; income: number; expenses: number }[] = [];
  const now = new Date();
  let score = 620, savings = 12, income = 380_000, expenses = 320_000;
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    score += Math.round((Math.random() - 0.3) * 18);
    savings += (Math.random() - 0.35) * 2.5;
    income += Math.round((Math.random() - 0.3) * 18_000);
    expenses += Math.round((Math.random() - 0.4) * 14_000);
    out.push({
      month: d.toLocaleDateString("en-NG", { month: "short", year: "2-digit" }),
      date: d.toISOString().slice(0, 10),
      score: Math.max(400, Math.min(900, score)),
      savings: Math.max(0, Math.min(60, savings)),
      income: Math.max(100_000, income),
      expenses: Math.max(80_000, expenses),
    });
  }
  return out;
}

function HistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [range, setRange] = useState<Range>("6M");
  const [metric, setMetric] = useState<Metric>("score");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  const months = RANGES.find((r) => r.id === range)!.months;
  const data = useMemo(() => generateSeries(months), [months]);
  const metricCfg = METRICS.find((m) => m.id === metric)!;

  const first = data[0]?.[metric] ?? 0;
  const last = data[data.length - 1]?.[metric] ?? 0;
  const delta = last - first;
  const pct = first ? (delta / first) * 100 : 0;
  const up = delta >= 0;

  const events = [
    { date: "Jun 2026", type: "Score Milestone", body: "Crossed the 740 threshold — entered B+ tier.", impact: 12 },
    { date: "May 2026", type: "Goal Achieved", body: "Hit ₦500K emergency fund target.", impact: 25 },
    { date: "Apr 2026", type: "Income Update", body: "Salary increment logged. Stability score boosted.", impact: 8 },
    { date: "Mar 2026", type: "Profile Change", body: "Linked Kuda + GTBank accounts.", impact: 15 },
    { date: "Feb 2026", type: "Risk Flag", body: "Spending spike detected on subscriptions.", impact: -6 },
    { date: "Jan 2026", type: "Score Started", body: "Initial NairaIQ assessment completed.", impact: 0 },
  ];

  return (
    <AppShell title="History & Trends" subtitle="Track every move your money makes">
      {/* Filters */}
      <section className="glass-card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Calendar className="w-4 h-4" /> Date range
        </div>
        <div className="flex rounded-lg bg-teal-overlay/40 p-1">
          {RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${range === r.id ? "bg-mint text-teal-dark" : "text-text-muted hover:text-white"}`}>
              {r.label}
            </button>
          ))}
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-mint hover:border-mint/40 transition">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </section>

      {/* Metric selector */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map((m) => {
          const cur = data[data.length - 1]?.[m.id] ?? 0;
          const prev = data[0]?.[m.id] ?? 0;
          const d = cur - prev;
          const isUp = d >= 0;
          const active = metric === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`glass-card p-4 text-left transition ${active ? "border-mint/60 mint-glow" : "hover:border-mint/30"}`}
              style={active ? { borderColor: m.color } : undefined}
            >
              <div className="text-[10px] uppercase tracking-widest text-text-muted">{m.label}</div>
              <div className="mt-2 font-mono text-xl font-semibold">{m.format(cur)}</div>
              <div className={`mt-1 inline-flex items-center gap-1 text-xs ${isUp ? "text-success" : "text-danger"}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? "+" : ""}{m.format(d)}
              </div>
            </button>
          );
        })}
      </section>

      {/* Main chart */}
      <section className="glass-card p-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-display font-semibold text-lg">{metricCfg.label} over time</h3>
            <p className="text-xs text-text-muted mt-0.5">{months} month window · {data.length} data points</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${up ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {up ? "+" : ""}{pct.toFixed(1)}% vs start of period
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="hFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricCfg.color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={metricCfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(141,217,215,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => metricCfg.format(Number(v))} />
              <Tooltip
                contentStyle={{ background: "#03363D", border: "1px solid rgba(141,217,215,0.25)", borderRadius: 12, color: "#fff" }}
                formatter={(v: number) => [metricCfg.format(v), metricCfg.label]}
              />
              <Area type="monotone" dataKey={metric} stroke={metricCfg.color} strokeWidth={3} fill="url(#hFill)" isAnimationActive animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Cashflow + Score change */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid stroke="rgba(141,217,215,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#03363D", border: "1px solid rgba(141,217,215,0.25)", borderRadius: 12, color: "#fff" }}
                  formatter={(v: number) => formatNaira(v)}
                />
                <Legend wrapperStyle={{ color: "#A8D5D3", fontSize: 12 }} />
                <Bar dataKey="income" name="Income" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Score velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="rgba(141,217,215,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#03363D", border: "1px solid rgba(141,217,215,0.25)", borderRadius: 12, color: "#fff" }} />
                <Line type="monotone" dataKey="score" stroke="#8DD9D7" strokeWidth={3} dot={{ fill: "#8DD9D7", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="glass-card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-lg">Milestones & events</h3>
            <p className="text-xs text-text-muted mt-0.5">Every change that moved your score</p>
          </div>
          <button className="text-text-muted hover:text-mint text-xs inline-flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
          {events.map((e, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[18px] top-2 w-3 h-3 rounded-full bg-mint ring-4 ring-teal-dark" />
              <div className="rounded-xl border border-border bg-teal-overlay/20 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-mint/15 text-mint flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-widest text-mint font-semibold">{e.type}</span>
                    <span className="text-xs text-text-muted">· {e.date}</span>
                  </div>
                  <div className="text-sm mt-1">{e.body}</div>
                </div>
                {e.impact !== 0 && (
                  <span className={`font-mono text-sm ${e.impact > 0 ? "text-success" : "text-danger"}`}>
                    {e.impact > 0 ? "+" : ""}{e.impact}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

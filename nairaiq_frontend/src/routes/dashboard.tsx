import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Sparkles, TrendingUp, Wallet, PiggyBank, AlertTriangle, Lightbulb, ArrowRight, Receipt } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api, formatNaira, type DashboardData } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ScoreGauge } from "@/components/ScoreGauge";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NairaIQ" }] }),
  component: DashboardPage,
});

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardData>("/dashboard"),
    enabled: isAuthenticated,
  });

  const name = user?.first_name || "there";
  const date = new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppShell title={`${greet()}, ${name} 👋`} subtitle={date}>
      {loading || !data ? <DashboardSkeleton /> : <DashboardContent data={data} />}
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card h-48 animate-pulse" />
      ))}
    </div>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <>
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 relative overflow-hidden mint-glow">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-mint/10 blur-3xl" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative">
            <ScoreGauge score={data.score} size={220} />
            <div>
              <div className="text-text-muted text-xs uppercase tracking-widest">Your NairaIQ Score</div>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-display text-4xl md:text-5xl font-bold">{data.grade}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-3 py-1 text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" /> +{data.delta} this week
                </span>
              </div>
              <p className="mt-3 text-text-body max-w-md">
                You're scoring better than <span className="text-mint font-semibold">{data.percentile}%</span> of NairaIQ users. Keep building those habits.
              </p>
              <button className="mt-5 inline-flex items-center gap-2 text-sm text-mint hover:underline">
                View full breakdown <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <StatCard icon={Wallet} label="Monthly Income" value={formatNaira(data.income)} trend="+8%" />
          <StatCard icon={PiggyBank} label="Savings Rate" value={`${data.savings_rate}%`} trend="+3%" />
          <StatCard icon={Receipt} label="Expense Ratio" value={`${data.expense_ratio}%`} trend="Stable" />
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <CardHeader title="Score Breakdown" sub="Across 6 financial dimensions" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.breakdown}>
                <PolarGrid stroke="rgba(141,217,215,0.18)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: "#A8D5D3", fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar dataKey="value" stroke="#8DD9D7" fill="#8DD9D7" fillOpacity={0.35} isAnimationActive animationDuration={1200} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6">
          <CardHeader title="Your Personalized Insights" sub="Tailored to your profile" />
          <div className="space-y-3">
            {data.insights.map((ins) => <InsightRow key={ins.id} insight={ins} />)}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <CardHeader title="Score Trend" sub="Last 6 months" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8DD9D7" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8DD9D7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(141,217,215,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#A8D5D3", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[600, 800]} tick={{ fill: "#A8D5D3", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#03363D", border: "1px solid rgba(141,217,215,0.2)", borderRadius: 12, color: "#fff" }} />
                <Area type="monotone" dataKey="score" stroke="#8DD9D7" strokeWidth={3} fill="url(#trendFill)" isAnimationActive animationDuration={1400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6">
          <CardHeader title="Top Recommendations" />
          <div className="space-y-3">
            {data.recommendations.map((r) => (
              <div key={r.id} className="rounded-xl border border-border p-4 hover:border-mint/40 transition">
                <div className="flex items-center gap-2 mb-1.5">
                  <PriorityBadge p={r.priority} />
                </div>
                <div className="font-semibold text-sm">{r.title}</div>
                <div className="text-xs text-text-muted mt-1">{r.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <CardHeader title="Recent Activity" />
        <div className="space-y-3">
          {data.timeline.map((e) => (
            <div key={e.id} className="flex items-center gap-4 rounded-xl bg-teal-overlay/30 px-4 py-3">
              <div className="w-9 h-9 rounded-lg bg-mint/15 text-mint flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{e.description}</div>
                <div className="text-xs text-text-muted">{e.type} · {e.date}</div>
              </div>
              <span className="text-mint font-mono text-sm">+{e.impact}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string; trend: string }) {
  return (
    <div className="glass-card p-5 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-mint/15 text-mint flex items-center justify-center"><Icon className="w-4 h-4" /></div>
        <span className="text-xs text-success">{trend}</span>
      </div>
      <div className="mt-4 text-xs text-text-muted uppercase tracking-wider">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold">{value}</div>
    </div>
  );
}

function CardHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="font-display font-semibold text-lg">{title}</h3>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
      <button className="text-text-muted hover:text-mint text-xs inline-flex items-center gap-1">
        View all <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

function InsightRow({ insight }: { insight: { category: string; title: string; body: string } }) {
  const map: Record<string, { color: string; Icon: any }> = {
    Savings: { color: "var(--mint)", Icon: PiggyBank },
    Risk: { color: "var(--warning)", Icon: AlertTriangle },
    Growth: { color: "var(--success)", Icon: TrendingUp },
    Banking: { color: "var(--mint)", Icon: Wallet },
  };
  const { color, Icon } = map[insight.category] || { color: "var(--mint)", Icon: Lightbulb };
  return (
    <div className="flex gap-3 rounded-xl border border-border p-3 hover:border-mint/40 transition">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}25`, color }}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color }}>{insight.category}</span>
        </div>
        <div className="text-sm font-medium mt-0.5">{insight.title}</div>
        <div className="text-xs text-text-muted mt-1">{insight.body}</div>
      </div>
    </div>
  );
}

function PriorityBadge({ p }: { p: "High" | "Medium" | "Low" }) {
  const colors = { High: "var(--danger)", Medium: "var(--warning)", Low: "var(--mint)" };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold" style={{ background: `${colors[p]}25`, color: colors[p] }}>
      {p}
    </span>
  );
}

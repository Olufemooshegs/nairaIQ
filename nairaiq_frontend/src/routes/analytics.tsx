import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Treemap } from "recharts";
import { TrendingUp, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/api";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — NairaIQ" }] }),
  component: AnalyticsPage,
});

type Period = "month" | "quarter" | "year";

function AnalyticsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [period, setPeriod] = useState<Period>("month");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  const mult = period === "month" ? 1 : period === "quarter" ? 3 : 12;
  const { data, isLoading: isQueryLoading } = useQuery({ queryKey: ["analytics", period], queryFn: () => api("/dashboard"), enabled: true });

  const palette = ["#8DD9D7", "#4ECDC4", "#FFB347", "#A8D5D3", "#FF6B6B", "#56C596"];

  const spending = useMemo(() => {
    if (!data) return [] as any[];
    const eb = data.expense_breakdown || [];
    if (Array.isArray(eb)) {
      return eb.map((e: any, i: number) => ({ name: e.label || e.name || e.dimension, value: e.value || 0, color: palette[i % palette.length] }));
    }
    if (typeof eb === "object" && eb !== null) {
      return Object.entries(eb).map(([k, v], i) => ({ name: k, value: v as number, color: palette[i % palette.length] }));
    }
    return [] as any[];
  }, [data, period]);

  const total = spending.reduce((s, x) => s + (x.value || 0), 0);

  const dimensions = (data?.breakdown || []).map((d: any) => ({ name: d.dimension, value: d.value, target: 100 }));

  const peer = [
    { bucket: "Bottom 25%", score: 480 },
    { bucket: "Median", score: 620 },
    { bucket: "Top 25%", score: 760 },
    { bucket: "Top 10%", score: 850 },
    { bucket: "You", score: data?.score ?? 0 },
  ];

  const radialData = [{ name: "Score", value: data?.score ?? 0, fill: "#8DD9D7" }];

  return (
    <AppShell title="Analytics" subtitle="Deep dive into your financial behavior">
      <section className="flex items-center justify-between glass-card p-4 flex-wrap gap-3">
        <p className="text-sm text-text-muted">Showing data for the past <span className="text-mint font-semibold">{period === "month" ? "30 days" : period === "quarter" ? "3 months" : "12 months"}</span></p>
        <div className="flex rounded-lg bg-teal-overlay/40 p-1">
          {(["month", "quarter", "year"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition ${period === p ? "bg-mint text-teal-dark" : "text-text-muted hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* KPI tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Spent" value={formatNaira(total - spending[spending.length - 1].value)} delta="-4.2%" positive />
        <KPI label="Saved" value={formatNaira(spending[spending.length - 1].value)} delta="+12%" positive />
        <KPI label="Top Category" value="Rent & Bills" delta="44% of spend" />
        <KPI label="Transactions" value={`${82 * mult}`} delta={`avg ₦${Math.round(total / (82 * mult)).toLocaleString()}`} />
      </section>

      {/* Spending breakdown + Radial score */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Where your Naira goes</h3>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spending} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {spending.map((s, i) => <Cell key={i} fill={s.color} stroke="none" />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#03363D", border: "1px solid rgba(141,217,215,0.25)", borderRadius: 12, color: "#fff" }}
                    formatter={(v: number) => formatNaira(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {spending.map((s) => {
                const pct = (s.value / total) * 100;
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{s.name}</span>
                        <span className="font-mono text-text-muted">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 bg-teal-overlay/40 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-display font-semibold text-lg">Financial Health</h3>
          <p className="text-xs text-text-muted mt-0.5">Overall NairaIQ score</p>
          <div className="relative flex-1 flex items-center justify-center min-h-64">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={20} fill="#8DD9D7" background={{ fill: "rgba(141,217,215,0.1)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="font-display text-4xl font-bold text-mint">{data?.score ?? "—"}</div>
              <div className="text-xs text-text-muted">/ 1000</div>
            </div>
          </div>
          <button className="text-mint text-xs inline-flex items-center gap-1 self-end">
            View report <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* Dimensions vs target */}
      <section className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Performance vs Target</h3>
        <div className="space-y-3">
          {dimensions.map((d) => {
            const pct = (d.value / d.target) * 100;
            const meetsTarget = d.value >= d.target;
            return (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{d.name}</span>
                  <span className="font-mono text-text-muted">
                    <span className={meetsTarget ? "text-success" : "text-mint"}>{d.value}</span> / {d.target}
                  </span>
                </div>
                <div className="h-2 bg-teal-overlay/40 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 h-full w-px bg-warning" style={{ left: `${(d.target / 100) * 100}%` }} />
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct * (d.target / 100))}%`, background: meetsTarget ? "var(--success)" : "var(--mint)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Peer comparison */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-1">How you compare</h3>
          <p className="text-xs text-text-muted mb-4">vs other Nigerians on NairaIQ</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peer} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="rgba(141,217,215,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="bucket" tick={{ fill: "#A8D5D3", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "#03363D", border: "1px solid rgba(141,217,215,0.25)", borderRadius: 12, color: "#fff" }} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {peer.map((p, i) => <Cell key={i} fill={p.bucket === "You" ? "#8DD9D7" : "rgba(141,217,215,0.3)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-1">Spending heatmap</h3>
          <p className="text-xs text-text-muted mb-4">Bigger blocks = more spend</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={spending} dataKey="value" stroke="#021f23" fill="#8DD9D7" content={<HeatCell />} />
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Observations */}
      <section className="glass-card p-6 border-mint/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-mint/15 text-mint flex items-center justify-center"><TrendingUp className="w-4 h-4" /></span>
          <h3 className="font-display font-semibold text-lg">Key observations</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(data?.insights && data.insights.length ? data.insights : []).map((o: any, i: number) => (
            <div key={o.id || i} className="rounded-xl border border-border bg-teal-overlay/20 p-4 flex gap-3">
              <span className="w-1 rounded-full shrink-0" style={{ background: i % 2 ? "var(--mint)" : "var(--warning)" }} />
              <div>
                <div className="text-sm font-semibold">{o.title}</div>
                <div className="text-xs text-text-muted mt-1">{o.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function KPI({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="glass-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-text-muted">{label}</div>
      <div className="mt-2 font-mono text-xl font-semibold">{value}</div>
      <div className={`mt-1 text-xs ${positive ? "text-success" : "text-text-muted"}`}>{delta}</div>
    </div>
  );
}

function HeatCell(props: any) {
  const { x, y, width, height, name, value, root } = props;
  if (width < 1 || height < 1) return null;
  const palette = ["#8DD9D7", "#4ECDC4", "#FFB347", "#A8D5D3", "#FF6B6B", "#56C596"];
  const idx = root?.children?.findIndex?.((c: any) => c.name === name) ?? 0;
  const fill = palette[idx % palette.length];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} fill={fill} stroke="#021f23" strokeWidth={2} />
      {width > 80 && height > 40 && (
        <>
          <text x={x + 10} y={y + 22} fill="#021f23" fontSize={12} fontWeight={600}>{name}</text>
          <text x={x + 10} y={y + 40} fill="#021f23" fontSize={11} opacity={0.7}>{formatNaira(value)}</text>
        </>
      )}
    </g>
  );
}

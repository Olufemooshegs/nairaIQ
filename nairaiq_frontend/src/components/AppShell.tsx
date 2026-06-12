import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, BarChart3, History, Home, LogOut, Settings as SettingsIcon, User as UserIcon, LineChart as LineIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { icon: Home, label: "Dashboard", to: "/dashboard" as const },
  { icon: BarChart3, label: "Analytics", to: "/analytics" as const },
  { icon: History, label: "History", to: "/history" as const },
  { icon: UserIcon, label: "Profile", to: "/profile" as const },
  { icon: SettingsIcon, label: "Settings", to: "/profile" as const },
];

const MOBILE = [
  { icon: Home, label: "Home", to: "/dashboard" as const },
  { icon: BarChart3, label: "Stats", to: "/analytics" as const },
  { icon: History, label: "History", to: "/history" as const },
  { icon: UserIcon, label: "Profile", to: "/profile" as const },
];

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const name = user?.first_name || "there";

  return (
    <div className="min-h-screen bg-hero-gradient text-white flex">
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] flex-col border-r border-border bg-teal-dark/80 backdrop-blur-md p-6 z-20">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-teal-dark">₦</span>
          NairaIQ
        </Link>
        <nav className="mt-10 space-y-1 flex-1">
          {NAV.map((it) => {
            const active = pathname === it.to;
            return (
              <Link key={it.label} to={it.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-mint/10 text-mint border border-mint/30" : "text-text-muted hover:text-white hover:bg-teal-overlay/40"}`}>
                <it.icon className="w-4 h-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-danger hover:bg-danger/10 transition">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      <div className="flex-1 lg:ml-[260px] min-w-0">
        <header className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold truncate">{title}</h1>
            {subtitle && <p className="text-text-muted text-sm mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-mint hover:border-mint/40 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger" />
            </button>
            <div className="w-10 h-10 rounded-full bg-mint text-teal-dark flex items-center justify-center font-semibold">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="px-4 md:px-8 py-2 pb-24 lg:pb-10 space-y-6 max-w-[1400px]">{children}</main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-teal-dark/90 backdrop-blur-md border-t border-border flex">
          {MOBILE.map((it) => {
            const active = pathname === it.to;
            return (
              <Link key={it.label} to={it.to} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${active ? "text-mint" : "text-text-muted"}`}>
                <it.icon className="w-5 h-5" /> {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export { LineIcon };

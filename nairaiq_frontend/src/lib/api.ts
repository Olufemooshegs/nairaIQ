// Lightweight API client with mock fallback.
// Set VITE_API_BASE_URL to point at your FastAPI backend.
// Calls fall through to in-memory mocks when the backend is unreachable
// so the UI is always demoable.

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const TOKEN_KEY = "nairaiq_token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function realRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const isForm = init && (init as any).body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (!isForm) defaultHeaders["Content-Type"] = "application/json";
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new Error((await res.text()) || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Mock layer ----------------------------------------------------------
const mockUser = {
  id: "mock-1",
  email: "demo@nairaiq.ng",
  first_name: "Tomi",
  last_name: "Adesina",
  phone_number: "+2348012345678",
};

export type DashboardData = {
  score: number;
  grade: string;
  percentile: number;
  delta: number;
  income: number;
  savings_rate: number;
  expense_ratio: number;
  breakdown: { dimension: string; value: number }[];
  insights: { id: string; category: string; title: string; body: string }[];
  trend: { month: string; score: number }[];
  recommendations: { id: string; priority: "High" | "Medium" | "Low"; title: string; description: string }[];
  timeline: { id: string; date: string; type: string; description: string; impact: number }[];
};

const mockDashboard: DashboardData = {
  score: 742,
  grade: "B+",
  percentile: 73,
  delta: 12,
  income: 450000,
  savings_rate: 23,
  expense_ratio: 71,
  breakdown: [
    { dimension: "Income Stability", value: 82 },
    { dimension: "Savings Rate", value: 68 },
    { dimension: "Debt Management", value: 75 },
    { dimension: "Investments", value: 54 },
    { dimension: "Emergency Fund", value: 71 },
    { dimension: "Banking Behavior", value: 88 },
  ],
  insights: [
    { id: "1", category: "Savings", title: "Boost your savings rate", body: "Increase from 23% to 30% to unlock a B+ grade jump." },
    { id: "2", category: "Risk", title: "Build emergency cushion", body: "You're 2 months short of the recommended 6-month buffer." },
    { id: "3", category: "Growth", title: "Start investing", body: "Move idle cash into a money market fund for 12-15% returns." },
    { id: "4", category: "Banking", title: "Consolidate accounts", body: "You have 3 inactive accounts. Closing them improves your score." },
  ],
  trend: [
    { month: "Jan", score: 680 },
    { month: "Feb", score: 695 },
    { month: "Mar", score: 702 },
    { month: "Apr", score: 715 },
    { month: "May", score: 730 },
    { month: "Jun", score: 742 },
  ],
  recommendations: [
    { id: "r1", priority: "High", title: "Open a high-yield savings account", description: "Earn 12% APY on idle funds." },
    { id: "r2", priority: "Medium", title: "Get health insurance", description: "Protect against medical emergencies." },
    { id: "r3", priority: "Low", title: "Review subscriptions", description: "You may be paying for unused services." },
  ],
  timeline: [
    { id: "t1", date: "2 days ago", type: "Score Update", description: "Score increased by 12 points", impact: 12 },
    { id: "t2", date: "1 week ago", type: "Goal Achieved", description: "Reached ₦500K emergency savings", impact: 25 },
    { id: "t3", date: "2 weeks ago", type: "Profile Change", description: "Updated income source", impact: 5 },
  ],
};

async function mockRequest<T>(path: string, init?: RequestInit): Promise<T> {
  await new Promise((r) => setTimeout(r, 350));
  const method = init?.method || "GET";
  if (path === "/auth/login" || path === "/auth/register") {
    const token = "mock-token-" + Date.now();
    tokenStore.set(token);
    return { access_token: token, token_type: "bearer", user: mockUser } as T;
  }
  if (path === "/auth/me") return mockUser as T;
  if (path === "/auth/logout") return {} as T;
  if (path === "/onboarding/status") {
    const done = localStorage.getItem("nairaiq_onboarded") === "1";
    return { is_complete: done, current_step: done ? 4 : 1, steps_completed: [] } as T;
  }
  if (path === "/onboarding/complete") {
    localStorage.setItem("nairaiq_onboarded", "1");
    return { ok: true } as T;
  }
  if (path.startsWith("/onboarding/")) return { ok: true } as T;
  if (path === "/dashboard") return mockDashboard as T;
  throw new Error(`No mock handler for ${method} ${path}`);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) return mockRequest<T>(path, init);
  try {
    return await realRequest<T>(path, init);
  } catch (e) {
    // Network/connection issues — fall back to mock so the UI keeps working.
    if (e instanceof TypeError) return mockRequest<T>(path, init);
    throw e;
  }
}

export const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const gradeFor = (score: number) => {
  if (score >= 900) return { grade: "A+", color: "var(--success)" };
  if (score >= 800) return { grade: "A", color: "var(--mint)" };
  if (score >= 700) return { grade: "B+", color: "var(--mint)" };
  if (score >= 600) return { grade: "B", color: "var(--warning)" };
  if (score >= 500) return { grade: "C", color: "var(--warning)" };
  if (score >= 400) return { grade: "D", color: "var(--danger)" };
  return { grade: "F", color: "var(--danger)" };
};

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "./api";

type User = { id: string; email: string; first_name: string; last_name: string; phone_number?: string };
type AuthCtx = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name?: string; last_name?: string; phone_number?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function mapUser(u: any): User {
  return {
    id: u.id,
    email: u.email || "",
    first_name: u.first_name || "",
    last_name: u.last_name || "",
    phone_number: u.phone_number || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Check custom API token first
    const token = tokenStore.get();
    if (token) {
      api<User>("/auth/me")
        .then((u) => {
          if (mounted) setUser(u);
        })
        .catch(() => tokenStore.clear())
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      // No token — not authenticated
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(res.access_token);
    const u = await api<User>("/auth/me");
    setUser(u);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; first_name?: string; last_name?: string; phone_number?: string }) => {
    const res = await api<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    tokenStore.set(res.access_token);
    const u = await api<User>("/auth/me");
    setUser(u);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Redirect to backend OAuth entry point which handles the Supabase OAuth flow.
    const base = import.meta.env.VITE_API_BASE_URL || "";
    window.location.href = `${base}/auth/oauth/google?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/";
  }, []);

  return (
    <Ctx.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, signInWithGoogle, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

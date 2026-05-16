/* eslint-disable react-refresh/only-export-components */
import { BACKEND_URL } from "../lib/config";
import axios, { type AxiosInstance } from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  analysisCount?: number;
}

type Result = { success: boolean; message?: string };

interface AppContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  api: AxiosInstance;
  login: (email: string, password: string) => Promise<Result>;
  register: (name: string, email: string, password: string) => Promise<Result>;
  logout: () => void;
}

const TOKEN_KEY = "token";

const AppContext = createContext<AppContextValue | undefined>(undefined);

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error))
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      fallback
    );
  return fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(null);
  // Only "loading" when there is a token to validate
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(localStorage.getItem(TOKEN_KEY)),
  );

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: BACKEND_URL });
    instance.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    return instance;
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get("/api/auth/user")
      .then(({ data }) => {
        if (!cancelled && data.success) setUser(data.user);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Runs once on mount for the stored token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = useCallback((data: { token: string; user: User }) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<Result> => {
      try {
        const { data } = await api.post("/api/auth/login", { email, password });
        if (data.success) {
          persistSession(data);
          return { success: true };
        }
        return { success: false, message: data.message };
      } catch (error) {
        return { success: false, message: errorMessage(error, "Login failed") };
      }
    },
    [api, persistSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<Result> => {
      try {
        const { data } = await api.post("/api/auth/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          persistSession(data);
          return { success: true };
        }
        return { success: false, message: data.message };
      } catch (error) {
        return {
          success: false,
          message: errorMessage(error, "Registration failed"),
        };
      }
    },
    [api, persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, api, login, register, logout }),
    [user, token, loading, api, login, register, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

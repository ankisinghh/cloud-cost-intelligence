import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, registerUnauthorizedHandler, clearUnauthorizedHandler } from "../services/apiClient";

export interface User {
  _id: string;
  email: string;
  role: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data);
      } catch (error: any) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    registerUnauthorizedHandler(() => {
      setUser(null);
      setLoading(false);
    });

    verifySession();

    return () => {
      clearUnauthorizedHandler();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      setUser(response.data);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/signup", { email, password });
      setUser(response.data);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.warn("Logout error", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <Ctx.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

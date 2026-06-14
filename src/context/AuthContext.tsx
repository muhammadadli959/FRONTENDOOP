/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getSession, saveSession, clearSession } from "../storage";
import type { Session, UserRole } from "../types";

interface AuthContextValue {
  session: Session | null;
  login: (username: string, role: UserRole, token?: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isUser: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession());

  useEffect(() => {
    if (session) saveSession(session);
    else clearSession();
  }, [session]);

  const login = (username: string, role: UserRole, token?: string) => {
    setSession({ username, role, token });
  };

  const logout = () => setSession(null);

  return (
    <AuthContext.Provider
      value={{
        session,
        login,
        logout,
        isAdmin: session?.role === "admin",
        isUser: session?.role === "user" || session?.role === "admin",
        isGuest: !session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

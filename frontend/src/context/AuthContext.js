import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "restaurant-auth";
const AuthContext = createContext(null);

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function readAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        token: parsed.token || "",
        user: parsed.user ? { ...parsed.user, role: normalizeRole(parsed.user.role) } : null
      };
    }

    const token = localStorage.getItem("token") || "";
    const role = normalizeRole(localStorage.getItem("role"));
    return { token, user: role ? { role } : null };
  } catch {
    return { token: "", user: null };
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => readAuth());

  useEffect(() => {
    if (state.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem("token", state.token);
      localStorage.setItem("role", state.user?.role || "");
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
  }, [state]);

  const value = useMemo(() => ({
    token: state.token,
    user: state.user,
    role: normalizeRole(state.user?.role),
    login: ({ token, user }) => setState({ token, user: user ? { ...user, role: normalizeRole(user.role) } : null }),
    logout: () => setState({ token: "", user: null })
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

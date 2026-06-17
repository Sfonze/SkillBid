"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";

const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

const ToastContext = createContext(null);
export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export default function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      setUser(null);
    } finally {
      setAuthLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const pushToast = useCallback((text, tone) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoaded, refreshUser, logout, setUser }}>
      <ToastContext.Provider value={{ pushToast, toasts }}>
        <Nav />
        <div className="app-main">{children}</div>
        <Footer />
        <CookieBanner />
        <div className="toast-wrap">
          {toasts.map((t) => (
            <div key={t.id} className={"toast " + (t.tone === "sage" ? "toast-sage" : t.tone === "clay" ? "toast-clay" : "")}>
              {t.text}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

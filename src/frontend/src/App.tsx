import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import BottomNav from "./components/BottomNav";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AchievementsPage from "./pages/AchievementsPage";
import AuthScreen from "./pages/AuthScreen";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import StatsPage from "./pages/StatsPage";

export type Page = "dashboard" | "stats" | "achievements" | "settings";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const initCalledRef = useRef(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Fire-and-forget initialize — sets up user state without blocking the UI
  useEffect(() => {
    if (!actor || !identity || isFetching || initCalledRef.current) return;
    initCalledRef.current = true;
    void actor.initialize();
  }, [actor, identity, isFetching]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full gold-gradient animate-pulse" />
          <p className="text-muted-foreground font-sans text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <AuthScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "stats":
        return <StatsPage />;
      case "achievements":
        return <AchievementsPage />;
      case "settings":
        return <SettingsPage theme={theme} onToggleTheme={toggleTheme} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20 overflow-y-auto">{renderPage()}</main>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      <Toaster richColors position="top-center" />
    </div>
  );
}

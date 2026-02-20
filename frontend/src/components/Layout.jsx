import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Radio, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { navItems } from "../data";
import { api } from "../lib/api";

function useRelativeTime(date) {
  const [label, setLabel] = useState("—");
  useEffect(() => {
    if (!date) {
      setLabel("—");
      return;
    }
    const update = () => {
      const diff = Math.floor((Date.now() - date) / 1000);
      if (diff < 10) setLabel("just now");
      else if (diff < 60) setLabel(`${diff}s ago`);
      else if (diff < 3600) setLabel(`${Math.floor(diff / 60)}m ago`);
      else setLabel(`${Math.floor(diff / 3600)}h ago`);
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, [date]);
  return label;
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking"); // checking | online | offline
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const location = useLocation();
  const relativeTime = useRelativeTime(lastRefreshed);

  const checkApi = useCallback(async () => {
    try {
      await api.healthCheck();
      setApiStatus("online");
      setLastRefreshed(Date.now());
    } catch {
      setApiStatus("offline");
    }
  }, []);

  useEffect(() => {
    checkApi();
    const id = setInterval(checkApi, 30000);
    return () => clearInterval(id);
  }, [checkApi]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl uppercase font-bold flex items-center gap-2 gradient-title">
            AQI Monitor
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-custom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-secondary hover:text-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground"
                    : "text-muted-foreground",
                )}>
                <Icon
                  className={cn(
                    "w-5 h-5 hover:text-white",
                    isActive ? "text-primary-foreground" : "text-primary",
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {/* API Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                API Status
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  apiStatus === "online" &&
                    "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)] animate-pulse",
                  apiStatus === "offline" &&
                    "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.5)]",
                  apiStatus === "checking" && "bg-yellow-400 animate-pulse",
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  apiStatus === "online" && "text-emerald-400",
                  apiStatus === "offline" && "text-red-400",
                  apiStatus === "checking" && "text-yellow-400",
                )}>
                {apiStatus === "online"
                  ? "Online"
                  : apiStatus === "offline"
                    ? "Offline"
                    : "Checking"}
              </span>
            </div>
          </div>

          {/* Last Refreshed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                Last refresh
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {relativeTime}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          sidebarOpen ? "block" : "hidden",
        )}>
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="absolute left-0 top-0 bottom-0 w-80 bg-card border-r border-border flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h1 className="text-2xl uppercase font-bold gradient-title">
              AQI Monitor
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-custom">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-secondary hover:text-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground",
                  )}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status footer */}
          <div className="p-4 border-t border-border space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  API Status
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    apiStatus === "online" &&
                      "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)] animate-pulse",
                    apiStatus === "offline" &&
                      "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.5)]",
                    apiStatus === "checking" && "bg-yellow-400 animate-pulse",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    apiStatus === "online" && "text-emerald-400",
                    apiStatus === "offline" && "text-red-400",
                    apiStatus === "checking" && "text-yellow-400",
                  )}>
                  {apiStatus === "online"
                    ? "Online"
                    : apiStatus === "offline"
                      ? "Offline"
                      : "Checking"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  Last refresh
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {relativeTime}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-lg uppercase font-bold gradient-title">
            AQI Monitor
          </h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-secondary rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-custom">
          {children}
        </main>
      </div>
    </div>
  );
}

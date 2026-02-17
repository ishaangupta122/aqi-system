import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Github, Menu, X } from "lucide-react";
import { cn } from "../lib/utils";
import { navItems } from "../data";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl uppercase font-bold text-primary flex items-center gap-2">
            🌍 AQI Monitor
          </h1>
          <p className="font-medium text-foreground mt-1">
            Air Quality Intelligence
          </p>
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

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Built with React + Vite</p>
            <p className="flex items-center gap-1">
              <Github className="w-3 h-3" />
              FastAPI Backend
            </p>
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
        <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                🌍 AQI Monitor
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Air Quality Intelligence
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
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
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-secondary rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-primary">🌍 AQI Monitor</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-custom">
          {children}
        </main>
      </div>
    </div>
  );
}

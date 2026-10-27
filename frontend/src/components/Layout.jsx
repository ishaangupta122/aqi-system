import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { api } from "../lib/api";

const links = [
  { to: "/", label: "Home" },
  { to: "/predict", label: "Predict" },
];

export default function Layout({ children }) {
  const [serverStatus, setServerStatus] = useState("checking"); // checking | up | down

  // Ask the server if it is up now and every 30 seconds
  useEffect(() => {
    const check = () =>
      api
        .healthCheck()
        .then(() => setServerStatus("up"))
        .catch(() => setServerStatus("down"));

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header: brand on the left, links on the right, same width as the page */}
      <header className="bg-card border-b border-border px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-4 flex items-center justify-between gap-4">
          <h1 className="text-sm md:text-lg uppercase font-semibold tracking-[0.15em] md:tracking-[0.2em] text-foreground whitespace-nowrap">
            AQI <span className="text-primary">Monitor</span>
          </h1>
          <nav className="flex items-center gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-custom">
        {children}
      </main>

      {/* Footer: server status */}
      <footer className="bg-card border-t border-border px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-3 flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              serverStatus === "up" && "bg-success",
              serverStatus === "down" && "bg-danger",
              serverStatus === "checking" && "bg-muted-foreground",
            )}
          />
          <span className="text-xs text-muted-foreground">
            {serverStatus === "up"
              ? "Server up"
              : serverStatus === "down"
                ? "Server down"
                : "Checking server"}
          </span>
        </div>
      </footer>
    </div>
  );
}

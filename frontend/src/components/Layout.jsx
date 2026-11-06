import { NavLink } from "react-router-dom";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Prediction" },
  { to: "/model-info", label: "Model Info" },
];

function linkClass({ isActive }) {
  const base =
    "px-2 min-[360px]:px-2.5 sm:px-3 py-1.5 rounded-md text-[13px] min-[360px]:text-sm font-medium whitespace-nowrap transition-colors";
  const color = isActive ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground";
  return `${base} ${color}`;
}

export default function Layout({ children }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header: logo on the left, links on the right, same width as the page */}
      <header className="border-b border-border px-4 md:px-8">
        <div className="max-w-6xl mx-auto py-3 flex items-center justify-between gap-2 sm:gap-4">
          <Logo />
          <nav className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-custom">
        {children}
      </main>
    </div>
  );
}

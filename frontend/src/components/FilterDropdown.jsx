import React from "react";
import { ChevronDown } from "lucide-react";

export default function FilterDropdown({
  label = "Filter:",
  value,
  onChange,
  options = [],
  className = "",
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 pr-8 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
      </div>
    </div>
  );
}

import { ChevronDown } from "lucide-react";

export default function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground mb-2">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 bg-secondary/50 border border-transparent rounded-md px-3 pr-10 text-sm text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none transition-colors">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
      </div>
    </label>
  );
}

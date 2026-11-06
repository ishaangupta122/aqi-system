const tones = {
  neutral: "bg-secondary/50 text-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/30",
};

// A column name
export function Chip({ tone = "neutral", children }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-mono border ${tones[tone]}`}>
      {children}
    </span>
  );
}

// A titled list of column names; `chips` are names or { name, tone }
export function ChipGroup({ title, chips }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {chips.map(({ name, tone }) => (
          <Chip key={name} tone={tone}>
            {name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

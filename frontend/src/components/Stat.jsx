// A number with its label; `tone` colours the number and `unit` follows it in small text
export default function Stat({ value, label, tone = "text-foreground", unit, title }) {
  return (
    <div className="bg-secondary/50 rounded-md p-4" title={title}>
      <p className={`text-2xl font-bold ${tone}`}>
        {value}
        {unit && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

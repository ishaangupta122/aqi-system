function StatCard({ icon: Icon, title, value, color }) {
  // Map text colors to border and background colors
  const colorStyles = {
    "text-blue-500": {
      border: "border-l-blue-500",
      bg: "bg-blue-500/10",
    },
    "text-green-500": {
      border: "border-l-green-500",
      bg: "bg-green-500/10",
    },
    "text-orange-500": {
      border: "border-l-orange-500",
      bg: "bg-orange-500/10",
    },
    "text-purple-500": {
      border: "border-l-purple-500",
      bg: "bg-purple-500/10",
    },
    "text-cyan-500": {
      border: "border-l-cyan-500",
      bg: "bg-cyan-500/10",
    },
    "text-yellow-500": {
      border: "border-l-yellow-500",
      bg: "bg-yellow-500/10",
    },
  };

  const styles = colorStyles[color] || {
    border: "border-l-primary",
    bg: "bg-primary/10",
  };

  return (
    <div
      className={`bg-card border-l-4 border border-secondary ${styles.border} rounded-lg overflow-hidden`}>
      <div className="flex items-center gap-4 p-3">
        <div
          className={`lex-shrink-0 self-stretch flex items-center justify-center rounded-lg px-4 ${styles.bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default StatCard;

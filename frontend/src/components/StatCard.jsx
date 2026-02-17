function StatCard({ icon: Icon, title, value, color }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-md bg-secondary ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="uppercase text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default StatCard;

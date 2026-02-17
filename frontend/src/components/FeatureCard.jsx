function FeatureCard({ icon, title, features }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-6 text-primary">{icon}</span>
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-muted-foreground">
            <span className="text-primary">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeatureCard;

function FeatureCard({ icon, title, features }) {
  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg p-4">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="w-6 h-6 text-primary">{icon}</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-muted-foreground">
            <span className="text-primary flex-shrink-0">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeatureCard;

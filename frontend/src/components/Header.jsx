function Header({ title, description }) {
  return (
    <div>
      <h1 className="text-3xl font-medium text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Header;

function Header({ title, description }) {
  return (
    <div className="pt-4 pb-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
        {title}
      </h1>
      <p className="text-sm md:text-base text-muted-foreground">{description}</p>
    </div>
  );
}

export default Header;

const tones = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
};

// A small rounded label
export default function Tag({ tone = "primary", className = "", children }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

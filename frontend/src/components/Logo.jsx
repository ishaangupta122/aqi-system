import { Wind } from "lucide-react";

// A plain link, not a router link, so clicking it always reloads the app on the home page
export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0" aria-label="AirSense home">
      <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/15 text-primary">
        <Wind className="w-6 h-6" strokeWidth={2.25} />
      </span>
      <span className="text-lg min-[360px]:text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-8">
        Air<span className="text-primary">Sense</span>
      </span>
    </a>
  );
}

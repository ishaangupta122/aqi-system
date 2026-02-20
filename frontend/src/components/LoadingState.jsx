import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Loading data..." }) {
  return (
    <div className="w-full border border-border rounded-lg bg-card flex flex-col items-center justify-center py-20 px-6 gap-4">
      <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

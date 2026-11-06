import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Loading data..." }) {
  return (
    <div className="w-full bg-secondary/50 rounded-md flex flex-col items-center justify-center py-14 px-6 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

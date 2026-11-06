import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  message = "Failed to load data",
  onRetry,
}) {
  return (
    <div className="w-full bg-secondary/50 rounded-md flex flex-col items-center justify-center py-14 px-6 gap-3">
      <AlertTriangle className="w-6 h-6 text-danger" />
      <p className="text-muted-foreground text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 h-9 text-sm rounded-md border border-border hover:bg-secondary text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

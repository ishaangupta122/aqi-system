import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  message = "Failed to load data",
  onRetry,
}) {
  return (
    <div className="w-full border border-border rounded-lg bg-card flex flex-col items-center justify-center py-20 px-6 gap-4">
      <div className="w-14 h-14 rounded-full border-2 border-danger/30 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-danger" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary/50 text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

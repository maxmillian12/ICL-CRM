import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-muted-foreground", className)} />;
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function TableLoader({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="animate-pulse space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={cn("h-8 rounded-lg bg-muted", j === 0 ? "w-1/3" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ApiError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-destructive text-lg">⚠</span>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs text-primary hover:underline mt-1"
        >
          Try again
        </button>
      )}
    </div>
  );
}

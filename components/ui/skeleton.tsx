import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={clsx(
        "relative rounded-xl overflow-hidden",
        "bg-gradient-to-r from-mist/50 via-parchment-warm/60 to-mist/50",
        "dark:from-ink-soft/30 dark:via-navy/40 dark:to-ink-soft/30",
        className
      )}
    >
      {/* Animated shimmer overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-shimmer"
        style={{ backgroundSize: "200% 100%" }}
      />
    </div>
  );
}

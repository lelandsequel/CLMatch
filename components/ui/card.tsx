import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl p-6",
        "bg-gradient-to-br from-white/95 via-cream/90 to-parchment/95",
        "border border-mist/50",
        "shadow-card hover:shadow-elevated",
        "backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-gold/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        "dark:from-navy/95 dark:via-navy-deep/90 dark:to-ink/95 dark:border-ink-soft/30",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mb-4 space-y-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx(
        "text-xl font-semibold tracking-tight text-ink dark:text-cream",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx(
        "text-sm text-ink-soft/80 dark:text-parchment-dark/70",
        className
      )}
      {...props}
    />
  );
}

/* Premium card variant with golden accent */
export function CardPremium({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl p-6",
        "bg-gradient-to-br from-white via-cream to-parchment-warm",
        "border border-gold/30",
        "shadow-card hover:shadow-glow",
        "backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-gold/10 before:via-transparent before:to-amber-glow before:opacity-60",
        "after:absolute after:inset-[1px] after:rounded-[15px] after:bg-gradient-to-br after:from-white/80 after:to-cream/60 after:backdrop-blur-sm",
        "dark:from-navy dark:via-navy-deep dark:to-ink dark:border-gold/20",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{props.children}</div>
    </div>
  );
}

/* Highlighted card with subtle animation */
export function CardHighlight({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl p-6",
        "bg-gradient-to-br from-white via-cream to-parchment",
        "border-2 border-gold/40",
        "shadow-elevated",
        "backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "hover:border-gold/60 hover:shadow-glow",
        "animate-pulse-glow",
        "dark:from-navy dark:via-navy-deep dark:to-ink dark:border-gold/30",
        className
      )}
      {...props}
    />
  );
}

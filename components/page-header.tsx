import type { ReactNode } from "react";
import clsx from "clsx";

export function PageHeader({
  title,
  subtitle,
  actions,
  className
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  const isOnDark = className?.includes("text-on-dark");
  
  return (
    <div className={clsx("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="space-y-3">
        <h1 className={clsx(
          "text-[38px] font-bold leading-[1.1] tracking-tight md:text-[52px]",
          isOnDark 
            ? "text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6),0_1px_4px_rgba(0,0,0,0.4)]"
            : "bg-gradient-to-br from-ink via-ink-soft to-ink-light bg-clip-text text-transparent dark:from-cream dark:via-parchment dark:to-gold-muted"
        )}>
          {title}
        </h1>
        {subtitle ? (
          <p className={clsx(
            "text-base max-w-xl leading-relaxed",
            isOnDark
              ? "text-white/80 [text-shadow:0_2px_8px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.3)]"
              : "text-ink-soft/80 dark:text-parchment-dark/70"
          )}>
            {subtitle}
          </p>
        ) : null}
        {/* Decorative underline */}
        <div className="flex items-center gap-2 pt-1">
          <div className={clsx(
            "h-1 w-12 rounded-full",
            isOnDark ? "bg-gradient-to-r from-amber-300 to-amber-200" : "bg-gradient-to-r from-gold to-gold-light"
          )} />
          <div className={clsx(
            "h-1 w-3 rounded-full",
            isOnDark ? "bg-amber-300/40" : "bg-gold/40"
          )} />
          <div className={clsx(
            "h-1 w-1.5 rounded-full",
            isOnDark ? "bg-amber-300/20" : "bg-gold/20"
          )} />
        </div>
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </div>
  );
}

/* Centered variant for hero sections */
export function PageHeaderCentered({
  title,
  subtitle,
  className
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  const isOnDark = className?.includes("text-on-dark");
  
  return (
    <div className={clsx("text-center space-y-4", className)}>
      <h2 className={clsx(
        "text-[32px] font-bold leading-[1.15] tracking-tight md:text-[42px]",
        isOnDark
          ? "text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6),0_1px_4px_rgba(0,0,0,0.4)]"
          : "bg-gradient-to-br from-ink via-ink-soft to-ink-light bg-clip-text text-transparent dark:from-cream dark:via-parchment dark:to-gold-muted"
      )}>
        {title}
      </h2>
      {subtitle ? (
        <p className={clsx(
          "text-base max-w-2xl mx-auto leading-relaxed",
          isOnDark
            ? "text-white/80 [text-shadow:0_2px_8px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.3)]"
            : "text-ink-soft/80 dark:text-parchment-dark/70"
        )}>
          {subtitle}
        </p>
      ) : null}
      {/* Centered decorative element */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className={clsx(
          "h-px w-8",
          isOnDark ? "bg-gradient-to-r from-transparent to-amber-300/40" : "bg-gradient-to-r from-transparent to-gold/40"
        )} />
        <div className={clsx(
          "h-1.5 w-1.5 rounded-full",
          isOnDark ? "bg-amber-300" : "bg-gold"
        )} />
        <div className={clsx(
          "h-px w-8",
          isOnDark ? "bg-gradient-to-l from-transparent to-amber-300/40" : "bg-gradient-to-l from-transparent to-gold/40"
        )} />
      </div>
    </div>
  );
}

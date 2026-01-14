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
  return (
    <div className={clsx("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="space-y-3">
        <h1 className="text-[38px] font-bold leading-[1.1] tracking-tight md:text-[52px] bg-gradient-to-br from-ink via-ink-soft to-ink-light bg-clip-text text-transparent dark:from-cream dark:via-parchment dark:to-gold-muted">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-base text-ink-soft/80 dark:text-parchment-dark/70 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        ) : null}
        {/* Decorative underline */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gold to-gold-light" />
          <div className="h-1 w-3 rounded-full bg-gold/40" />
          <div className="h-1 w-1.5 rounded-full bg-gold/20" />
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
  return (
    <div className={clsx("text-center space-y-4", className)}>
      <h2 className="text-[32px] font-bold leading-[1.15] tracking-tight md:text-[42px] bg-gradient-to-br from-ink via-ink-soft to-ink-light bg-clip-text text-transparent dark:from-cream dark:via-parchment dark:to-gold-muted">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-base text-ink-soft/80 dark:text-parchment-dark/70 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      ) : null}
      {/* Centered decorative element */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold/40" />
        <div className="h-1.5 w-1.5 rounded-full bg-gold" />
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold/40" />
      </div>
    </div>
  );
}

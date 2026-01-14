import clsx from "clsx";

export function FitBadge({ score }: { score: number }) {
  const tone = score >= 80 
    ? "bg-gradient-to-r from-sage/20 to-sage/10 text-sage border-sage/30" 
    : score >= 60 
      ? "bg-gradient-to-r from-gold/20 to-gold/10 text-gold-dark border-gold/30" 
      : "bg-gradient-to-r from-mist/60 to-mist/40 text-ink-soft/70 border-mist/50";
  
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 hover:shadow-soft",
      tone
    )}>
      <span className={clsx(
        "h-1.5 w-1.5 rounded-full",
        score >= 80 ? "bg-sage" : score >= 60 ? "bg-gold" : "bg-ink-soft/40"
      )} />
      Fit {score}
    </span>
  );
}

export function GhostBadge({ score }: { score: number }) {
  const tone = score >= 70 
    ? "bg-gradient-to-r from-terracotta/20 to-terracotta/10 text-terracotta border-terracotta/30" 
    : score >= 50 
      ? "bg-gradient-to-r from-amber/20 to-amber/10 text-amber border-amber/30" 
      : "bg-gradient-to-r from-sage/20 to-sage/10 text-sage border-sage/30";
  
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 hover:shadow-soft",
      tone
    )}>
      <span className={clsx(
        "h-1.5 w-1.5 rounded-full",
        score >= 70 ? "bg-terracotta" : score >= 50 ? "bg-amber" : "bg-sage"
      )} />
      Ghost {score}
    </span>
  );
}

export function AtsBadge({ atsType }: { atsType: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold/20 bg-gradient-to-r from-cream/60 to-parchment/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft/70 transition-all duration-200 hover:border-gold/40 hover:shadow-soft dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark/60">
      {atsType}
    </span>
  );
}

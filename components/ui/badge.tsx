import type { HTMLAttributes } from "react";
import clsx from "clsx";

const variants = {
  default: clsx(
    "bg-gradient-to-r from-cream to-parchment",
    "border border-gold/30",
    "text-ink-soft",
    "shadow-soft"
  ),
  gold: clsx(
    "bg-gradient-to-r from-gold/20 to-amber-glow",
    "border border-gold/40",
    "text-gold-dark",
    "shadow-soft"
  ),
  premium: clsx(
    "bg-gradient-to-r from-ink to-ink-soft",
    "border border-gold/20",
    "text-gold-light",
    "shadow-button"
  ),
  success: clsx(
    "bg-gradient-to-r from-sage/20 to-sage/10",
    "border border-sage/40",
    "text-sage"
  ),
  warning: clsx(
    "bg-gradient-to-r from-amber/20 to-amber/10",
    "border border-amber/40",
    "text-amber"
  )
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1",
        "text-xs font-semibold uppercase tracking-wider",
        "transition-all duration-200",
        "hover:shadow-card",
        variants[variant],
        "dark:bg-navy dark:border-gold/20 dark:text-gold-light",
        className
      )}
      {...props}
    />
  );
}

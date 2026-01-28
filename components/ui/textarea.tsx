import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "min-h-[120px] w-full rounded-xl border border-gold/20 bg-gradient-to-br from-white/90 to-cream/70 px-4 py-3 text-sm text-ink shadow-sm outline-none transition-all duration-200",
        "placeholder:text-ink-soft/40",
        "focus:border-gold/50 focus:ring-2 focus:ring-gold/10 focus:shadow-soft",
        "hover:border-gold/30",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "dark:from-navy/90 dark:to-navy-deep/70 dark:text-cream dark:border-gold/10 dark:placeholder:text-parchment-dark/30",
        "dark:focus:border-gold/40 dark:focus:ring-gold/5",
        className
      )}
      {...props}
    />
  );
}

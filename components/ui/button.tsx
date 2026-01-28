import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

const base =
  "relative inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden";

const variants = {
  primary: clsx(
    "bg-gradient-to-br from-ink to-ink-soft text-cream",
    "shadow-button hover:shadow-button-hover",
    "hover:from-ink-soft hover:to-ink",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-gold/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
    "active:scale-[0.98]"
  ),
  secondary: clsx(
    "bg-cream/80 text-ink border-2 border-mist/60",
    "shadow-soft hover:shadow-card",
    "hover:border-gold/40 hover:bg-cream",
    "backdrop-blur-sm",
    "active:scale-[0.98]"
  ),
  ghost: clsx(
    "bg-transparent text-ink",
    "hover:bg-gold/10 hover:text-ink-soft",
    "active:bg-gold/20"
  ),
  gold: clsx(
    "bg-gradient-to-br from-gold to-gold-dark text-ink",
    "shadow-button hover:shadow-glow",
    "hover:from-gold-light hover:to-gold",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
    "active:scale-[0.98]"
  )
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

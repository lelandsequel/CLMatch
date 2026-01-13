import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

const base =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants = {
  primary: "bg-midnight text-white shadow-card hover:bg-ink focus-visible:ring-midnight",
  secondary:
    "bg-white text-midnight border border-mist hover:border-ink dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
  ghost: "bg-transparent text-midnight hover:bg-mist/60 dark:text-slate-200 dark:hover:bg-slate-800"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

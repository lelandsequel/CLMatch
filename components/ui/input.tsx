import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

const inputBase = clsx(
  "w-full rounded-xl px-4 text-sm text-ink",
  "bg-gradient-to-br from-white to-cream/80",
  "border border-mist/60",
  "shadow-soft",
  "outline-none transition-all duration-200",
  "placeholder:text-ink-soft/40",
  "focus:border-gold/50 focus:shadow-card focus:ring-2 focus:ring-gold/10",
  "hover:border-gold/30",
  "dark:from-navy dark:to-navy-deep dark:border-ink-soft/30 dark:text-cream",
  "dark:placeholder:text-parchment-dark/30",
  "dark:focus:border-gold/40 dark:focus:ring-gold/5"
);

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(inputBase, "h-11", className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(inputBase, "py-3 min-h-[100px] resize-y", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: InputHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      className={clsx(
        inputBase,
        "h-11 appearance-none cursor-pointer",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23d4a853%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

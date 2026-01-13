import type { ReactNode } from "react";
import clsx from "clsx";

export function StatCard({
  title,
  value,
  helper,
  icon,
  className
}: {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-mist bg-white/90 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink dark:text-white">{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

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
    <div className={clsx("flex flex-wrap items-center justify-between gap-4", className)}>
      <div className="space-y-2">
        <h1 className="text-[38px] font-semibold leading-tight md:text-[48px]">{title}</h1>
        {subtitle ? <p className="text-base text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </div>
  );
}

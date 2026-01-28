import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Section({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={clsx("container relative", className)} {...props} />;
}

/* Section with decorative divider */
export function SectionDivided({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={clsx("container relative", className)} {...props}>
      {/* Top brush stroke divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full" />
      {children}
    </section>
  );
}

/* Section with light beam effect */
export function SectionIlluminated({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={clsx("container relative overflow-hidden", className)} {...props}>
      {/* Diagonal light beam */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-gold/5 via-amber/3 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

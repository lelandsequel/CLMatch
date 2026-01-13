import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Section({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={clsx("container", className)} {...props} />;
}

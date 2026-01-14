"use client";

import { useEffect } from "react";
import clsx from "clsx";

export function Toast({
  message,
  type = "success",
  onDone
}: {
  message: string;
  type?: "success" | "error";
  onDone?: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium shadow-card backdrop-blur-sm animate-fade-in-up",
        type === "success" 
          ? "bg-gradient-to-r from-sage/95 to-sage/85 text-white border border-sage/50" 
          : "bg-gradient-to-r from-terracotta/95 to-terracotta/85 text-white border border-terracotta/50"
      )}
    >
      <span className={clsx(
        "flex-shrink-0 h-2 w-2 rounded-full animate-pulse",
        type === "success" ? "bg-white" : "bg-white"
      )} />
      {message}
    </div>
  );
}

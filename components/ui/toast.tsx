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
        "fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm shadow-card",
        type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
      )}
    >
      {message}
    </div>
  );
}

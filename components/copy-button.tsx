"use client";

import { useState } from "react";
import clsx from "clsx";

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied"
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={onCopy}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200",
        copied
          ? "bg-gradient-to-r from-sage/20 to-sage/10 text-sage border border-sage/30"
          : "bg-gradient-to-r from-cream/80 to-parchment/60 text-ink-soft/70 border border-gold/20 hover:border-gold/40 hover:text-gold hover:shadow-soft dark:from-navy/80 dark:to-navy-deep/60 dark:text-parchment-dark/60"
      )}
    >
      {copied ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
          {copiedLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

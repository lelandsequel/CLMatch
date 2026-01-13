"use client";

import { useState } from "react";
import { Button } from "./ui/button";

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
    <Button variant="ghost" onClick={onCopy} className="text-xs">
      {copied ? copiedLabel : label}
    </Button>
  );
}

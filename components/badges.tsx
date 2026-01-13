import clsx from "clsx";

export function FitBadge({ score }: { score: number }) {
  const tone = score >= 80 ? "bg-emerald-100 text-emerald-700" : score >= 60 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600";
  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", tone)}>Fit {score}</span>;
}

export function GhostBadge({ score }: { score: number }) {
  const tone = score >= 70 ? "bg-rose-100 text-rose-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", tone)}>Ghost {score}</span>;
}

export function AtsBadge({ atsType }: { atsType: string }) {
  return (
    <span className="rounded-full border border-mist px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {atsType}
    </span>
  );
}

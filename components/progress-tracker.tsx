import clsx from "clsx";

const steps = ["Draft", "Processing", "Needs Review", "Approved"] as const;

type Status = (typeof steps)[number];

export function ProgressTracker({ status }: { status: Status }) {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={clsx(
              "h-3 w-3 rounded-full",
              index <= currentIndex ? "bg-accent" : "bg-mist"
            )}
          />
          <span className={clsx("text-xs uppercase tracking-widest", index <= currentIndex ? "text-ink" : "text-slate-400")}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

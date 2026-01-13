import clsx from "clsx";

const steps = ["Parsing", "Sourcing", "Draft", "Needs Review", "Approved"] as const;

type Step = (typeof steps)[number];

export function Stepper({ status }: { status: Step }) {
  const currentIndex = steps.indexOf(status);
  return (
    <div className="flex flex-wrap gap-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={clsx(
              "h-2.5 w-2.5 rounded-full",
              index <= currentIndex ? "bg-accent" : "bg-mist dark:bg-slate-700"
            )}
          />
          <span
            className={clsx(
              "text-[11px] uppercase tracking-[0.2em]",
              index <= currentIndex ? "text-ink dark:text-white" : "text-slate-400"
            )}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

import clsx from "clsx";

const steps = ["Parsing", "Sourcing", "Draft", "Needs Review", "Approved"] as const;

type Step = (typeof steps)[number];

export function Stepper({ status }: { status: Step }) {
  const currentIndex = steps.indexOf(status);
  return (
    <div className="flex flex-wrap gap-4">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        
        return (
          <div key={step} className="flex items-center gap-2.5 group">
            {/* Step indicator */}
            <div
              className={clsx(
                "relative h-3 w-3 rounded-full transition-all duration-300",
                isComplete && "bg-gradient-to-br from-gold to-gold-dark shadow-glow",
                isCurrent && "bg-gradient-to-br from-gold-light to-gold ring-4 ring-gold/20 animate-pulse-glow",
                isPending && "bg-mist/60 dark:bg-ink-soft/40"
              )}
            >
              {/* Inner glow for active states */}
              {(isComplete || isCurrent) && (
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              )}
            </div>
            
            {/* Step label */}
            <span
              className={clsx(
                "text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200",
                isComplete && "text-gold-dark dark:text-gold",
                isCurrent && "text-ink dark:text-cream font-semibold",
                isPending && "text-ink-soft/50 dark:text-parchment-dark/40"
              )}
            >
              {step}
            </span>
            
            {/* Connector line (except for last item) */}
            {index < steps.length - 1 && (
              <div 
                className={clsx(
                  "hidden sm:block w-6 h-px ml-1 transition-colors duration-300",
                  isComplete ? "bg-gradient-to-r from-gold to-gold/40" : "bg-mist/40 dark:bg-ink-soft/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

interface OnePageToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function OnePageToggle({ enabled, onToggle }: OnePageToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-cream/80 dark:bg-navy/80 border border-mist/50 dark:border-ink-soft/30 rounded-xl backdrop-blur-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <span className="font-medium text-ink dark:text-cream">
            One-Page Condenser
          </span>
        </div>
        <p className="text-sm text-ink-soft dark:text-parchment-dark mt-1">
          Automatically condense your resume to fit one page by prioritizing
          relevant experience
        </p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`flex-shrink-0 ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          enabled ? "bg-gold" : "bg-mist dark:bg-ink-soft"
        }`}
        aria-label="Toggle one-page condenser"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

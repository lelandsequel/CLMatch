"use client";

interface ATSScoreProps {
  score: number;
  label: string;
  variant: "before" | "after";
  animated?: boolean;
}

export function ATSScore({
  score,
  label,
  variant,
  animated = false,
}: ATSScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "rgb(34, 197, 94)"; // green-500
    if (score >= 70) return "rgb(196, 161, 62)"; // gold
    return "rgb(239, 68, 68)"; // red-500
  };

  const color = getScoreColor(score);

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        variant === "after"
          ? "bg-green-500/5 border-green-500/20 dark:bg-green-500/10"
          : "bg-cream/50 border-mist/50 dark:bg-navy/50 dark:border-ink-soft/30"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-ink-soft dark:text-parchment-dark">
          {label}
        </span>
        <span className="text-2xl font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="h-2 bg-mist/30 dark:bg-ink-soft/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            animated ? "animate-score-bar" : ""
          }`}
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="mt-2 text-xs text-ink-soft dark:text-parchment-dark">
        {variant === "before" ? (
          <span>⚠️ May be filtered by ATS</span>
        ) : (
          <span>✓ Optimized for ATS systems</span>
        )}
      </div>
    </div>
  );
}

interface ATSScoreComparisonProps {
  beforeScore: number;
  afterScore: number;
}

export function ATSScoreComparison({
  beforeScore,
  afterScore,
}: ATSScoreComparisonProps) {
  return (
    <div className="mb-8 p-6 bg-cream/80 dark:bg-navy/80 border border-mist/50 dark:border-ink-soft/30 rounded-xl backdrop-blur-sm">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-1 text-ink dark:text-cream">
          ATS Compatibility Score
        </h3>
        <p className="text-sm text-ink-soft dark:text-parchment-dark">
          See how your resume performs against HR screening systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ATSScore score={beforeScore} label="Before Optimization" variant="before" />
        <ATSScore
          score={afterScore}
          label="After Optimization"
          variant="after"
          animated
        />
      </div>

      <div className="mt-4 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          +{afterScore - beforeScore}% improvement
        </span>
      </div>
    </div>
  );
}

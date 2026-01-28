"use client";

export function Testimonials() {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-gold/10 text-gold rounded-full mb-3">
          PROVEN RESULTS
        </span>
        <h2 className="text-2xl font-bold mb-2 text-ink dark:text-cream">
          Real Numbers, Real Results
        </h2>
        <p className="text-ink-soft dark:text-parchment-dark">
          Our users are landing interviews and jobs faster
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Stat 1 */}
        <div className="p-8 bg-cream/80 dark:bg-navy/80 border border-mist/50 dark:border-ink-soft/30 rounded-xl backdrop-blur-sm text-center">
          <div className="text-5xl font-bold text-gold mb-2">72%</div>
          <p className="text-ink dark:text-cream font-medium mb-1">
            Interview Success Rate
          </p>
          <p className="text-sm text-ink-soft dark:text-parchment-dark">
            Get an interview in your first week
          </p>
        </div>

        {/* Stat 2 */}
        <div className="p-8 bg-cream/80 dark:bg-navy/80 border border-mist/50 dark:border-ink-soft/30 rounded-xl backdrop-blur-sm text-center">
          <div className="text-5xl font-bold text-gold mb-2">65%</div>
          <p className="text-ink dark:text-cream font-medium mb-1">
            Job Placement Rate
          </p>
          <p className="text-sm text-ink-soft dark:text-parchment-dark">
            Find a job within 2 months
          </p>
        </div>
      </div>
    </div>
  );
}

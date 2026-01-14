export function EnvMissingPanel({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-gold/30 bg-gradient-to-br from-parchment-warm/80 to-cream/60 p-8 text-sm shadow-card dark:from-navy/80 dark:to-navy-deep/60 dark:border-gold/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-gold/20 to-amber/10 flex items-center justify-center text-xl">
          ⚠️
        </span>
        <h2 className="text-xl font-bold text-ink dark:text-cream">Missing env vars</h2>
      </div>
      
      <p className="text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed">
        Set the following environment variables to enable the dashboard:
      </p>
      
      {/* Missing vars list */}
      <ul className="mt-5 space-y-2.5">
        {missing.map((key) => (
          <li key={key} className="flex items-center gap-3 rounded-xl border border-gold/20 bg-gradient-to-r from-cream/80 to-parchment/60 px-4 py-3 font-mono text-xs text-ink dark:from-navy/80 dark:to-navy-deep/60 dark:text-cream dark:border-gold/10">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-amber" />
            {key}
          </li>
        ))}
      </ul>
      
      {/* Help link */}
      <div className="mt-6 pt-5 border-t border-gold/20">
        <p className="text-ink-soft/70 dark:text-parchment-dark/60">
          See{" "}
          <a 
            href="https://github.com/lelandsequel/CLMatch#readme" 
            className="text-gold hover:text-gold-dark underline underline-offset-2 transition-colors duration-200"
          >
            README.md
          </a>{" "}
          for setup instructions.
        </p>
      </div>
    </div>
  );
}

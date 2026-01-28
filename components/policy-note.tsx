export function PolicyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-center text-ink-soft/70 dark:text-parchment-dark/70 ${className}`}>
      No guarantees, no refunds. For packages $199+, we provide free optimized resumes until you land a job.
    </p>
  );
}

export function PolicyNoteLight({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-center text-white/50 ${className}`}>
      No guarantees, no refunds. For packages $199+, we provide free optimized resumes until you land a job.
    </p>
  );
}

export function EnvMissingPanel({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
      <h2 className="text-lg font-semibold">Missing env vars</h2>
      <p className="mt-1">Set the following to enable the dashboard:</p>
      <ul className="mt-3 space-y-1">
        {missing.map((key) => (
          <li key={key}>• {key}</li>
        ))}
      </ul>
      <p className="mt-4">
        See{" "}
        <a href="https://github.com/lelandsequel/CLMatch#readme" className="underline">
          README.md
        </a>{" "}
        for setup instructions.
      </p>
    </div>
  );
}

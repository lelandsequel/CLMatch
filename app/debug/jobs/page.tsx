import DebugJobsClient from "./DebugJobsClient";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function DebugJobsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isProd = process.env.NODE_ENV === "production";
  const debugPassword = process.env.DEBUG_UI_PASSWORD;
  const enabled = !isProd || Boolean(debugPassword);

  if (!enabled) {
    return (
      <main style={{ padding: "2rem", fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Debug Jobs</h1>
        <p>Debug UI disabled in production.</p>
      </main>
    );
  }

  const requiresPassword = isProd && Boolean(debugPassword);
  const provided = typeof resolvedParams?.pw === "string" ? resolvedParams?.pw : "";

  if (requiresPassword && provided !== debugPassword) {
    return (
      <main style={{ padding: "2rem", fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Debug Jobs</h1>
        <p style={{ marginBottom: "1rem" }}>Password required.</p>
        <form method="get" style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="password"
            name="pw"
            placeholder="DEBUG_UI_PASSWORD"
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              minWidth: "220px"
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: "#111827",
              color: "white",
              cursor: "pointer"
            }}
          >
            Unlock
          </button>
        </form>
      </main>
    );
  }

  return <DebugJobsClient />;
}

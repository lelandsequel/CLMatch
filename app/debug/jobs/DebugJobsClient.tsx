"use client";

import { useEffect, useState } from "react";

type JobRow = {
  job_id?: string;
  title: string;
  company_name: string;
  location?: string | null;
  apply_url?: string | null;
  source_url?: string | null;
  ats_type: string;
  fit_score: number;
  ghost_risk_score: number;
  short_summary?: string;
};

type PipelineResult = {
  run_id: string;
  jobs: JobRow[];
  stats: {
    discovered: number;
    fetched: number;
    parsed: number;
    deduped: number;
    scored: number;
  };
};

const containerStyle: React.CSSProperties = {
  padding: "2rem",
  fontFamily: "ui-sans-serif, system-ui",
  color: "#0f172a",
  background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
  minHeight: "100vh"
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "16px",
  padding: "1.5rem",
  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e2e8f0",
  marginBottom: "1.5rem"
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  fontSize: "0.9rem"
};

const inputStyle: React.CSSProperties = {
  padding: "0.6rem 0.8rem",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
  background: "#f8fafc"
};

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default function DebugJobsClient() {
  const [candidateId, setCandidateId] = useState("");
  const [preferredTitles, setPreferredTitles] = useState("RevOps Manager, BizOps Analyst");
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [contractOk, setContractOk] = useState(false);
  const [targetJobUrl, setTargetJobUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [creatingCandidate, setCreatingCandidate] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("cljm_candidate_id");
    if (stored) setCandidateId(stored);
  }, []);

  useEffect(() => {
    if (candidateId) {
      window.localStorage.setItem("cljm_candidate_id", candidateId);
    }
  }, [candidateId]);

  const runPipeline = async () => {
    setError("");
    setResult(null);

    if (!candidateId || !isUuid(candidateId)) {
      setError("Enter a valid candidate_id UUID.");
      return;
    }

    const titles = parseCsv(preferredTitles);
    const resumeProfile = {
      skills: [],
      tools: [],
      roles: titles,
      seniority: "mid",
      industries: [],
      keywords: titles,
      locations: [],
      achievements: []
    };

    const payload = {
      candidate_id: candidateId,
      resume_profile_json: resumeProfile,
      preferences: {
        remote_only: remoteOnly,
        contract_ok: contractOk,
        preferred_titles: titles,
        industries_prefer: [],
        industries_avoid: []
      },
      target_job_url: targetJobUrl || null,
      max_results: 10
    };

    setLoading(true);
    try {
      const response = await fetch("/api/jobs/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-job-pipeline-secret": secret } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as PipelineResult & { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Pipeline failed");
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createCandidate = async () => {
    setError("");
    setCreatingCandidate(true);
    try {
      const response = await fetch("/api/debug/create-candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-job-pipeline-secret": secret } : {})
        },
        body: JSON.stringify({})
      });
      const data = (await response.json()) as { candidate_id?: string; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Failed to create candidate");
        return;
      }
      if (data.candidate_id) {
        setCandidateId(data.candidate_id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cljm_candidate_id", data.candidate_id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create candidate");
    } finally {
      setCreatingCandidate(false);
    }
  };

  return (
    <main style={containerStyle}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Debug Job Pipeline</h1>
        <p style={{ marginBottom: "1.5rem", color: "#475569" }}>
          Fast sanity check for the sourcing + scoring engine. Use a service-only candidate UUID.
        </p>

        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Need a UUID? Create a test candidate in one click.
            </p>
            <button
              type="button"
              onClick={createCandidate}
              disabled={creatingCandidate}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "10px",
                border: "1px solid #cbd5f5",
                background: "#ffffff",
                cursor: creatingCandidate ? "not-allowed" : "pointer",
                fontSize: "0.85rem"
              }}
            >
              {creatingCandidate ? "Creating..." : "Create test candidate"}
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem"
            }}
          >
            <label style={labelStyle}>
              Candidate ID (UUID)
              <input
                style={inputStyle}
                value={candidateId}
                onChange={(event) => setCandidateId(event.target.value)}
                placeholder="00000000-0000-0000-0000-000000000000"
              />
            </label>
            <label style={labelStyle}>
              Preferred titles (comma)
              <input
                style={inputStyle}
                value={preferredTitles}
                onChange={(event) => setPreferredTitles(event.target.value)}
              />
            </label>
            <label style={labelStyle}>
              Target job URL (optional)
              <input
                style={inputStyle}
                value={targetJobUrl}
                onChange={(event) => setTargetJobUrl(event.target.value)}
                placeholder="https://job-boards.greenhouse.io/..."
              />
            </label>
            <label style={labelStyle}>
              JOB_PIPELINE_SECRET (optional)
              <input
                style={inputStyle}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="x-job-pipeline-secret"
                type="password"
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(event) => setRemoteOnly(event.target.checked)}
              />
              Remote only
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={contractOk}
                onChange={(event) => setContractOk(event.target.checked)}
              />
              Contract ok
            </label>
          </div>

          <button
            type="button"
            onClick={runPipeline}
            disabled={loading}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              border: "none",
              background: loading ? "#94a3b8" : "#0f172a",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600
            }}
          >
            {loading ? "Running..." : "Run Pipeline"}
          </button>

          {error ? (
            <p style={{ color: "#dc2626", marginTop: "1rem" }}>{error}</p>
          ) : null}
        </section>

        {result ? (
          <section style={cardStyle}>
            <h2 style={{ marginBottom: "0.25rem" }}>Run {result.run_id}</h2>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>
              Discovered {result.stats.discovered}, fetched {result.stats.fetched}, parsed {result.stats.parsed},
              deduped {result.stats.deduped}, scored {result.stats.scored}.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ paddingBottom: "0.5rem" }}>Title</th>
                    <th style={{ paddingBottom: "0.5rem" }}>Company</th>
                    <th style={{ paddingBottom: "0.5rem" }}>Fit</th>
                    <th style={{ paddingBottom: "0.5rem" }}>Ghost</th>
                    <th style={{ paddingBottom: "0.5rem" }}>ATS</th>
                    <th style={{ paddingBottom: "0.5rem" }}>Apply</th>
                  </tr>
                </thead>
                <tbody>
                  {result.jobs.map((job, index) => (
                    <tr key={`${job.title}-${index}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.6rem 0" }}>
                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{job.location ?? ""}</div>
                      </td>
                      <td>{job.company_name}</td>
                      <td>{job.fit_score}</td>
                      <td>{job.ghost_risk_score}</td>
                      <td style={{ textTransform: "capitalize" }}>{job.ats_type}</td>
                      <td>
                        <a
                          href={job.apply_url ?? job.source_url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2563eb" }}
                        >
                          Apply
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

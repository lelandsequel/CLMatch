import { NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase/server";

function checkPipelineSecret(request: Request) {
  const secret = process.env.JOB_PIPELINE_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("JOB_PIPELINE_SECRET must be set in production.");
      return { ok: false, status: 500, error: "Server misconfigured" };
    }
    console.warn("JOB_PIPELINE_SECRET not set; allowing request for local dev.");
    return { ok: true };
  }
  const header = request.headers.get("x-job-pipeline-secret");
  if (header !== secret) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

export async function GET(request: Request) {
  const authCheck = checkPipelineSecret(request);
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get("run_id");
    const candidateId = searchParams.get("candidate_id");
    const supabase = getServiceSupabase();

    if (runId) {
      const { data, error } = await supabase
        .from("job_runs")
        .select("*, jobs(*)")
        .eq("id", runId)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json({ run: data }, { status: 200 });
    }

    if (candidateId) {
      const { data, error } = await supabase
        .from("job_runs")
        .select("*, jobs(*)")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json({ run: data }, { status: 200 });
    }

    return NextResponse.json({ error: "Provide run_id or candidate_id" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

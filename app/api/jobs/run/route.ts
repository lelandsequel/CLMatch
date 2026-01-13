import { NextResponse } from "next/server";
import { runJobPipeline } from "../../../../lib/jobs/pipeline";
import type { PipelineInput } from "../../../../lib/jobs/types";
import { isUuid } from "../../../../lib/jobs/utils";

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

export async function POST(request: Request) {
  const authCheck = checkPipelineSecret(request);
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = (await request.json()) as PipelineInput;
    if (!body?.candidate_id || !body?.resume_profile_json || !body?.preferences) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    // candidate_id must be provided by a trusted server caller, not a public client
    if (!isUuid(body.candidate_id)) {
      return NextResponse.json({ error: "Invalid candidate_id" }, { status: 400 });
    }

    const result = await runJobPipeline(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

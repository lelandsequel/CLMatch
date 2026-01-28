import { NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase/server";

function requireSecret(request: Request) {
  const secret = process.env.JOB_PIPELINE_SECRET;
  if (!secret) {
    return { ok: false, status: 500, error: "JOB_PIPELINE_SECRET not set" };
  }
  const header = request.headers.get("x-job-pipeline-secret");
  if (header !== secret) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  const check = requireSecret(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("candidates")
      .insert({ email: body.email ?? null })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ candidate_id: data.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

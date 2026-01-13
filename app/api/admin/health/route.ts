import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { isAdminUser } from "../../../../lib/admin";
import { getServiceSupabase } from "../../../../lib/supabase/server";

async function checkTable(table: string) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from(table).select("id").limit(1);
  return !error;
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = getServiceSupabase();
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    const tables = [
      "orders",
      "intakes",
      "artifacts",
      "admin_notes",
      "qc_results",
      "job_runs",
      "jobs",
      "candidates"
    ];

    const tableChecks = await Promise.all(
      tables.map(async (table) => ({ table, ok: await checkTable(table) }))
    );

    const bucketNames = (buckets ?? []).map((bucket) => bucket.name);
    const hasIntakes = bucketNames.includes("intakes");
    const hasReports = bucketNames.includes("reports");

    const env = {
      stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
      resend: Boolean(process.env.RESEND_API_KEY),
      jobSecret: Boolean(process.env.JOB_PIPELINE_SECRET),
      openai: Boolean(process.env.OPENAI_API_KEY)
    };

    return NextResponse.json({
      supabase: !bucketError,
      buckets: { intakes: hasIntakes, reports: hasReports },
      env,
      tables: tableChecks
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

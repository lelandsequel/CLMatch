import { getServiceSupabase } from "../supabase/server";
import type { QCResult } from "./index";

export async function createQcResult(payload: QCResult & { run_id?: string | null }) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("qc_results").insert({
    order_id: payload.order_id,
    run_id: payload.run_id ?? null,
    tier_id: payload.tier_id,
    qc_strictness: payload.qc_strictness,
    confidence_total: payload.confidence_total,
    confidence_resume: payload.confidence_resume,
    confidence_jobs: payload.confidence_jobs,
    confidence_outreach: payload.confidence_outreach,
    confidence_certs: payload.confidence_certs,
    hard_fail: payload.hard_fail,
    flags: payload.flags
  });
  if (error) throw error;
}

export async function getLatestQcResult(orderId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("qc_results")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

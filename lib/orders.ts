import { getServiceSupabase } from "./supabase/server";

export type OrderStatus =
  | "draft"
  | "processing"
  | "qc_repairing"
  | "auto_qc_failed"
  | "needs_review"
  | "approved_auto"
  | "approved_manual"
  | "delivered"
  | "failed";

export async function createOrder(payload: {
  email: string;
  full_name?: string | null;
  stripe_session_id?: string | null;
  stripe_payment_status?: string | null;
  product_tier?: string | null;
  tier_id?: string | null;
  price_usd?: number | null;
  included_features?: Record<string, unknown> | null;
  max_jobs?: number | null;
  status?: OrderStatus;
}) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      email: payload.email,
      full_name: payload.full_name ?? null,
      stripe_session_id: payload.stripe_session_id ?? null,
      stripe_payment_status: payload.stripe_payment_status ?? null,
      product_tier: payload.product_tier ?? payload.tier_id ?? null,
      tier_id: payload.tier_id ?? null,
      price_usd: payload.price_usd ?? null,
      included_features: payload.included_features ?? null,
      max_jobs: payload.max_jobs ?? null,
      status: payload.status ?? "draft"
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

export async function updateOrderAdminNote(orderId: string, note: string) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("admin_notes").insert({ order_id: orderId, note });
  if (error) throw error;
}

export async function createIntake(payload: {
  order_id: string;
  resume_storage_path: string;
  linkedin_url?: string | null;
  target_titles: string[];
  seniority: string;
  preferences: Record<string, unknown>;
  target_job_url?: string | null;
  target_jd?: string | null;
  resume_profile_json?: Record<string, unknown> | null;
}) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("intakes")
    .insert({
      order_id: payload.order_id,
      resume_storage_path: payload.resume_storage_path,
      linkedin_url: payload.linkedin_url ?? null,
      target_titles: payload.target_titles,
      seniority: payload.seniority,
      preferences: payload.preferences,
      target_job_url: payload.target_job_url ?? null,
      target_jd: payload.target_jd ?? null,
      resume_profile_json: payload.resume_profile_json ?? null
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function createArtifact(payload: { order_id: string; kind: string; storage_path: string }) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("artifacts").insert({
    order_id: payload.order_id,
    kind: payload.kind,
    storage_path: payload.storage_path
  });
  if (error) throw error;
}

export async function updateIntakeProfile(intakeId: string, profile: Record<string, unknown>) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("intakes").update({ resume_profile_json: profile }).eq("id", intakeId);
  if (error) throw error;
}

export async function updateIntakeOutputs(payload: {
  intakeId: string;
  outreach_text: string;
  gap_suggestions: string[];
  cert_suggestions: string[];
  resume_ats_text?: string | null;
  resume_patch_notes?: string | null;
  keyword_map?: string[] | null;
  pivot_pathways_json?: Record<string, unknown> | null;
}) {
  const supabase = getServiceSupabase();
  const updates: Record<string, unknown> = {
    outreach_text: payload.outreach_text,
    gap_suggestions: payload.gap_suggestions,
    cert_suggestions: payload.cert_suggestions,
    resume_ats_text: payload.resume_ats_text ?? null,
    resume_patch_notes: payload.resume_patch_notes ?? null,
    keyword_map: payload.keyword_map ?? null
  };
  if (payload.pivot_pathways_json !== undefined) {
    updates.pivot_pathways_json = payload.pivot_pathways_json;
  }
  const { error } = await supabase.from("intakes").update(updates).eq("id", payload.intakeId);
  if (error) throw error;
}

export async function findOrderBySession(sessionId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function findOrderById(orderId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrderDetail(orderId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*, intakes(*), artifacts(*), job_runs(*, jobs(*)), admin_notes(*), qc_results(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listOrders() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*, intakes(*), artifacts(*), admin_notes(*), job_runs(*, jobs(*)), qc_results(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listOrdersForEmail(email: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*, intakes(*), artifacts(*), admin_notes(*), job_runs(*, jobs(*)), qc_results(*)")
    .eq("email", email)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

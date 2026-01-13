import type { User } from "@supabase/supabase-js";

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const allowlist = process.env.ADMIN_EMAILS?.split(",").map((item) => item.trim().toLowerCase()) ?? [];
  return allowlist.includes(email.toLowerCase());
}

export function isAdminUser(user: User | null) {
  if (process.env.ADMIN_BYPASS === "true") return true;
  return isAdminEmail(user?.email ?? null);
}

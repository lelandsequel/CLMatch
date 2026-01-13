import { createClient } from "@supabase/supabase-js";

function isValidUrl(value?: string | null) {
  if (!value || value.includes("YOUR_")) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidKey(value?: string | null) {
  if (!value || value.includes("YOUR_")) return false;
  return value.length > 10;
}

export function hasPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return isValidUrl(url) && isValidKey(anonKey);
}

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isValidUrl(url) || !isValidKey(anonKey)) {
    if (typeof window !== "undefined") {
      console.warn("Supabase client env missing. Set NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
    return null;
  }

  return createClient(url as string, anonKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

export const createBrowserSupabaseClient = createBrowserClient;

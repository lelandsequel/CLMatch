export const REQUIRED_PUBLIC_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function isValidUrl(value?: string | null) {
  if (!value) return false;
  if (value.includes("YOUR_")) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidKey(value?: string | null) {
  if (!value) return false;
  if (value.includes("YOUR_")) return false;
  return value.length > 10;
}

export function getMissingPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const missing: string[] = [];
  if (!isValidUrl(url)) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!isValidKey(anon)) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing;
}

export function hasRequiredPublicEnv() {
  return getMissingPublicEnv().length === 0;
}

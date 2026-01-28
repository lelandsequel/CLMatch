import { createServerClient } from "./supabase/server";

function getTokenFromCookies(cookieHeader: string) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/sb-access-token=([^;]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  const altMatch = cookieHeader.match(/supabase-auth-token=([^;]+)/);
  if (altMatch?.[1]) return decodeURIComponent(altMatch[1]);
  return null;
}

export function getTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) return token;
  const cookieHeader = request.headers.get("cookie") || "";
  return getTokenFromCookies(cookieHeader);
}

export async function getUserFromRequest(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user;
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

import crypto from "crypto";
import { STOPWORDS } from "./constants";

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(sr|sr\.)\b/g, "senior")
    .replace(/\b(jr|jr\.)\b/g, "junior")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function uniqueTokens(values: string[]) {
  return Array.from(new Set(values));
}

export function hashKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function extractSentences(text: string, maxSentences = 2) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, maxSentences).join(" ").trim();
}

export function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

import { extractSentences } from "./utils";

export async function summarizeJob(description: string) {
  const endpoint = process.env.LLM_SUMMARY_ENDPOINT;
  if (!endpoint) {
    return extractSentences(description, 2);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LLM_API_KEY ?? ""}`
      },
      body: JSON.stringify({
        instruction: "Summarize this job description in 2-3 crisp sentences. No fabrication.",
        input: description
      })
    });
    if (!response.ok) {
      return extractSentences(description, 2);
    }
    const data = (await response.json()) as { summary?: string };
    return data.summary ?? extractSentences(description, 2);
  } catch {
    return extractSentences(description, 2);
  }
}

export async function extractPostedDate(text: string) {
  const endpoint = process.env.LLM_DATE_ENDPOINT;
  if (!endpoint) return null;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LLM_API_KEY ?? ""}`
      },
      body: JSON.stringify({
        instruction: "Extract a posted date from this text. Return ISO 8601 or null.",
        input: text
      })
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { posted_at?: string | null };
    return data.posted_at ?? null;
  } catch {
    return null;
  }
}

import type { ResumeProfile } from "./extractResumeProfile";

export async function generateResumeATS(payload: {
  fullName: string;
  baseText: string;
  profile: ResumeProfile;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return payload.baseText;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Rewrite the resume into an ATS-optimized format. Be truthful: only rephrase or reorganize existing content. No new employers, degrees, or metrics." 
          },
          {
            role: "user",
            content: `Name: ${payload.fullName}\n\nResume Text:\n${payload.baseText.slice(0, 12000)}`
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return payload.baseText;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? payload.baseText;
  } catch {
    return payload.baseText;
  }
}

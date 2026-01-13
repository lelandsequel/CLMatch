export async function generateCertsAndGaps(payload: {
  profileSummary: string;
  targetTitles: string[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      gaps: [
        "Sharpen ATS keyword alignment for target roles",
        "Expand quantified impact in recent experience"
      ],
      certs: [
        "Tableau Desktop Specialist",
        "Google Data Analytics"
      ]
    };
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
              "Provide a concise skill gap list (3-5 bullets) and certification suggestions (3-5). Only infer from the provided summary. Avoid fabricating credentials." 
          },
          {
            role: "user",
            content: `Profile summary: ${payload.profileSummary}\nTarget roles: ${payload.targetTitles.join(", ")}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      return { gaps: [], certs: [] };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const lines = content.split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
    const gaps = lines.slice(0, 5);
    const certs = lines.slice(5, 10);
    return { gaps, certs };
  } catch {
    return { gaps: [], certs: [] };
  }
}

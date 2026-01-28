export async function generateOutreach(payload: {
  fullName: string;
  targetTitles: string[];
  companyList: string[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `Recruiter outreach:\nHi [Name], I'm ${payload.fullName}. I'm targeting ${payload.targetTitles.join(", ")} roles and would love to learn more about your open roles.\n\nHiring manager outreach:\nHi [Name], I'm ${payload.fullName}. I noticed your team is hiring and I can help drive measurable impact fast.\n\nCadence:\nDay 1: Reach out\nDay 3: Follow-up\nDay 7: Share value add\nDay 10: Final ping`;
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
              "Draft recruiter + hiring manager outreach scripts and a 14-day follow-up cadence. Keep it concise and truthful; do not fabricate experience." 
          },
          {
            role: "user",
            content: `Candidate: ${payload.fullName}\nTarget roles: ${payload.targetTitles.join(", ")}\nTarget companies: ${payload.companyList.slice(0, 5).join(", ")}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      return "";
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

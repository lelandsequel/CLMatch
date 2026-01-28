import type { ResumeProfile } from "./extractResumeProfile";

export async function generateResumePatchNotes(payload: {
  fullName: string;
  resumeText: string;
  profile: ResumeProfile;
  targetTitles: string[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return heuristicPatchNotes(payload);
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
              "Create concise resume patch notes. Only use facts from the resume. Output bullet points for headline, skills, and top 3 bullet upgrades. No fabrication."
          },
          {
            role: "user",
            content: `Target roles: ${payload.targetTitles.join(", ")}\nResume:\n${payload.resumeText.slice(0, 12000)}`
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return heuristicPatchNotes(payload);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? heuristicPatchNotes(payload);
  } catch {
    return heuristicPatchNotes(payload);
  }
}

function heuristicPatchNotes(payload: {
  profile: ResumeProfile;
  targetTitles: string[];
}) {
  const role = payload.targetTitles[0] ?? "Target role";
  const skills = payload.profile.skills.slice(0, 6).join(", ") || "core skills";
  const achievements = payload.profile.achievements.slice(0, 3);
  const bullets = achievements.length
    ? achievements.map((item) => `Bullet upgrade: emphasize ${item.trim()}`)
    : ["Bullet upgrade: add quantified impact metrics to your top 2 achievements."];

  return [
    `Headline: ${role} | ${skills}`,
    `Skills: highlight ${skills}.`,
    ...bullets
  ].join("\n");
}

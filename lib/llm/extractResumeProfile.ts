import { normalizeText, tokenize, uniqueTokens } from "../jobs/utils";
import { TOOL_KEYWORDS } from "../jobs/constants";

export type ResumeProfile = {
  skills: string[];
  tools: string[];
  roles: string[];
  seniority: string;
  industries: string[];
  keywords: string[];
  locations: string[];
  achievements: string[];
};

const fallbackProfile: ResumeProfile = {
  skills: [],
  tools: [],
  roles: [],
  seniority: "mid",
  industries: [],
  keywords: [],
  locations: [],
  achievements: []
};

export async function extractResumeProfile(text: string): Promise<ResumeProfile> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return heuristicExtract(text);
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
              "Extract a resume profile JSON. Only use explicit info from the resume. Do not invent employers, degrees, skills, or metrics. Return strict JSON with keys: skills, tools, roles, seniority, industries, keywords, locations, achievements. Use arrays of strings; use empty arrays if unknown."
          },
          {
            role: "user",
            content: text.slice(0, 12000)
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      return heuristicExtract(text);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as ResumeProfile;
    return {
      ...fallbackProfile,
      ...parsed
    };
  } catch {
    return heuristicExtract(text);
  }
}

function heuristicExtract(text: string): ResumeProfile {
  const normalized = normalizeText(text);
  const tokens = uniqueTokens(tokenize(normalized));
  const tools = TOOL_KEYWORDS.filter((tool) => normalized.includes(normalizeText(tool)));
  const skills = tokens.filter((token) => token.length > 3).slice(0, 20);
  const achievements = text
    .split("\n")
    .filter((line) => /\d+%|\$\d+|\d+x|\b\d{2,}\b/.test(line))
    .slice(0, 5);

  return {
    skills,
    tools,
    roles: [],
    seniority: normalized.includes("director") ? "director" : "mid",
    industries: [],
    keywords: skills.slice(0, 10),
    locations: [],
    achievements
  };
}

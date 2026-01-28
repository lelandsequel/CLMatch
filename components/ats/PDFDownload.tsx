"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "../ui/button";

// Dynamically import react-pdf components to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

// Import templates
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type ResumeTemplate = "clean-modern" | "executive" | "technical" | "creative";

export interface ParsedResume {
  name: string;
  title?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  summary?: string;
  experience: {
    company: string;
    title: string;
    dates: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    dates?: string;
    details?: string;
  }[];
  skills: string[];
}

// Parse the AI-generated resume text into structured data
export function parseResumeText(text: string): ParsedResume {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  
  const resume: ParsedResume = {
    name: "",
    contact: {},
    experience: [],
    education: [],
    skills: [],
  };

  let section = "";
  let currentExp: ParsedResume["experience"][0] | null = null;
  let currentEdu: ParsedResume["education"][0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Detect section headers
    if (upper.includes("PROFESSIONAL EXPERIENCE") || upper.includes("EXPERIENCE") || upper.includes("WORK HISTORY")) {
      section = "experience";
      continue;
    }
    if (upper.includes("EDUCATION")) {
      section = "education";
      continue;
    }
    if (upper.includes("SKILLS") || upper.includes("TECHNICAL SKILLS") || upper.includes("CORE COMPETENCIES")) {
      section = "skills";
      continue;
    }
    if (upper.includes("SUMMARY") || upper.includes("PROFESSIONAL SUMMARY") || upper.includes("PROFILE")) {
      section = "summary";
      continue;
    }

    // First non-section line is usually the name
    if (!resume.name && !section && line.length < 50 && !line.includes("@") && !line.includes("|")) {
      resume.name = line;
      continue;
    }

    // Contact info
    if (!section || section === "contact") {
      if (line.includes("@")) {
        const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) resume.contact.email = emailMatch[0];
      }
      if (line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
        const phoneMatch = line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) resume.contact.phone = phoneMatch[0];
      }
      if (line.includes("linkedin.com")) {
        resume.contact.linkedin = line;
      }
      if (line.match(/[A-Z][a-z]+,?\s*[A-Z]{2}/) && !resume.contact.location) {
        resume.contact.location = line.split("|")[0].trim();
      }
    }

    // Summary section
    if (section === "summary") {
      if (!resume.summary) {
        resume.summary = line;
      } else {
        resume.summary += " " + line;
      }
      continue;
    }

    // Experience section
    if (section === "experience") {
      const datePattern = /(\d{4}\s*[-–]\s*(Present|\d{4}))|((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i;
      
      if (datePattern.test(line) && !line.startsWith("•") && !line.startsWith("-") && !line.startsWith("*")) {
        if (currentExp) resume.experience.push(currentExp);
        
        const parts = line.split(/\s*[|•]\s*/).filter(Boolean);
        const dateMatch = line.match(datePattern);
        const dates = dateMatch ? dateMatch[0] : "";
        
        currentExp = {
          company: parts[0] || "",
          title: parts[1] || "",
          dates: dates,
          bullets: [],
        };
        
        if (parts.length === 1) {
          currentExp.title = parts[0].replace(datePattern, "").trim();
          currentExp.company = "";
        }
        continue;
      }

      if ((line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("–")) && currentExp) {
        currentExp.bullets.push(line.replace(/^[•\-*–]\s*/, ""));
        continue;
      }

      if (currentExp && !line.startsWith(" ") && line.length < 80) {
        if (!currentExp.company) currentExp.company = line;
        else if (!currentExp.title) currentExp.title = line;
      }
    }

    // Education section
    if (section === "education") {
      const datePattern = /\d{4}/;
      
      if (!line.startsWith("•") && !line.startsWith("-") && line.length > 5) {
        if (currentEdu) resume.education.push(currentEdu);
        
        currentEdu = {
          school: line.split(/[|,]/)[0].trim(),
          degree: line.split(/[|,]/)[1]?.trim() || "",
          dates: line.match(datePattern)?.[0] || "",
        };
        continue;
      }
      
      if (currentEdu && (line.startsWith("•") || line.startsWith("-"))) {
        currentEdu.details = (currentEdu.details || "") + " " + line.replace(/^[•\-]\s*/, "");
      }
    }

    // Skills section
    if (section === "skills") {
      const skillLine = line.replace(/^[•\-*]\s*/, "");
      const skillItems = skillLine.split(/[,;|•]/).map((s) => s.trim()).filter(Boolean);
      resume.skills.push(...skillItems);
    }
  }

  if (currentExp) resume.experience.push(currentExp);
  if (currentEdu) resume.education.push(currentEdu);
  resume.skills = [...new Set(resume.skills)];

  return resume;
}

// ============ STYLES ============
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#333" },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: "#2563eb", paddingBottom: 15 },
  name: { fontSize: 24, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 15 },
  contactItem: { fontSize: 9, color: "#64748b" },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#2563eb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  summary: { fontSize: 10, lineHeight: 1.5, color: "#475569" },
  expEntry: { marginBottom: 12 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  expCompany: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  expDates: { fontSize: 9, color: "#64748b" },
  expTitle: { fontSize: 10, color: "#475569", marginBottom: 4 },
  bullet: { fontSize: 9, marginLeft: 10, marginBottom: 2, lineHeight: 1.4, color: "#475569" },
  eduEntry: { marginBottom: 8 },
  eduSchool: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  eduDegree: { fontSize: 10, color: "#475569" },
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skill: { fontSize: 9, backgroundColor: "#f1f5f9", padding: "4 8", borderRadius: 4, color: "#475569" },
});

// Resume Document Component
function ResumeDocument({ data }: { data: ParsedResume }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.name || "Your Name"}</Text>
          <View style={styles.contactRow}>
            {data.contact.email && <Text style={styles.contactItem}>{data.contact.email}</Text>}
            {data.contact.phone && <Text style={styles.contactItem}>{data.contact.phone}</Text>}
            {data.contact.location && <Text style={styles.contactItem}>{data.contact.location}</Text>}
          </View>
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.expEntry}>
                <View style={styles.expHeader}>
                  <Text style={styles.expCompany}>{exp.company}</Text>
                  <Text style={styles.expDates}>{exp.dates}</Text>
                </View>
                <Text style={styles.expTitle}>{exp.title}</Text>
                {exp.bullets.map((bullet, j) => (
                  <Text key={j} style={styles.bullet}>• {bullet}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.eduEntry}>
                <Text style={styles.eduSchool}>{edu.school}</Text>
                <Text style={styles.eduDegree}>{edu.degree} {edu.dates && `| ${edu.dates}`}</Text>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {data.skills.slice(0, 20).map((skill, i) => (
                <Text key={i} style={styles.skill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

// PDF Download Button Component
interface PDFDownloadButtonProps {
  resumeText: string;
  template: ResumeTemplate;
  disabled?: boolean;
}

export function PDFDownloadButton({ resumeText, template, disabled }: PDFDownloadButtonProps) {
  const [isReady, setIsReady] = useState(false);
  
  if (!resumeText || disabled) {
    return (
      <Button variant="gold" disabled>
        Download PDF ↓
      </Button>
    );
  }

  const parsedResume = parseResumeText(resumeText);

  return (
    <PDFDownloadLink
      document={<ResumeDocument data={parsedResume} />}
      fileName={`resume-${template}.pdf`}
    >
      {({ loading, error }) => (
        <Button variant="gold" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : error ? (
            "Error - Try Again"
          ) : (
            "Download PDF ↓"
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

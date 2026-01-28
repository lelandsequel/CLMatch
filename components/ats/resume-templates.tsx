"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts for better typography
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

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

    // Contact info (email, phone, location on same or next lines)
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
      // Location patterns
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
      // Detect new job entry (usually has dates like 2020-2023 or Jan 2020 - Present)
      const datePattern = /(\d{4}\s*[-–]\s*(Present|\d{4}))|((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i;
      
      if (datePattern.test(line) && !line.startsWith("•") && !line.startsWith("-") && !line.startsWith("*")) {
        // Save previous experience
        if (currentExp) {
          resume.experience.push(currentExp);
        }
        
        // Parse the line - could be "Company | Title | Dates" or "Title at Company | Dates"
        const parts = line.split(/\s*[|•]\s*/).filter(Boolean);
        const dateMatch = line.match(datePattern);
        const dates = dateMatch ? dateMatch[0] : "";
        
        currentExp = {
          company: parts[0] || "",
          title: parts[1] || "",
          dates: dates,
          bullets: [],
        };
        
        // If title and company are swapped or combined, try to detect
        if (parts.length === 1) {
          currentExp.title = parts[0].replace(datePattern, "").trim();
          currentExp.company = "";
        }
        continue;
      }

      // Bullet points
      if ((line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("–")) && currentExp) {
        currentExp.bullets.push(line.replace(/^[•\-*–]\s*/, ""));
        continue;
      }

      // Non-bullet continuation might be company/title clarification
      if (currentExp && !line.startsWith(" ") && line.length < 80) {
        if (!currentExp.company) {
          currentExp.company = line;
        } else if (!currentExp.title) {
          currentExp.title = line;
        }
      }
    }

    // Education section
    if (section === "education") {
      const datePattern = /\d{4}/;
      
      if (!line.startsWith("•") && !line.startsWith("-") && line.length > 5) {
        if (currentEdu) {
          resume.education.push(currentEdu);
        }
        
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
      // Skills often comma-separated or bullet-pointed
      const skillLine = line.replace(/^[•\-*]\s*/, "");
      const skillItems = skillLine.split(/[,;|•]/).map((s) => s.trim()).filter(Boolean);
      resume.skills.push(...skillItems);
    }
  }

  // Push final entries
  if (currentExp) resume.experience.push(currentExp);
  if (currentEdu) resume.education.push(currentEdu);

  // Dedupe skills
  resume.skills = [...new Set(resume.skills)];

  return resume;
}

// ============ CLEAN MODERN TEMPLATE ============
const cleanModernStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  contactItem: {
    fontSize: 9,
    color: "#64748b",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#475569",
  },
  expEntry: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  expCompany: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  expDates: {
    fontSize: 9,
    color: "#64748b",
  },
  expTitle: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 2,
    lineHeight: 1.4,
    color: "#475569",
  },
  eduEntry: {
    marginBottom: 8,
  },
  eduSchool: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  eduDegree: {
    fontSize: 10,
    color: "#475569",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skill: {
    fontSize: 9,
    backgroundColor: "#f1f5f9",
    padding: "4 8",
    borderRadius: 4,
    color: "#475569",
  },
});

export function CleanModernTemplate({ data }: { data: ParsedResume }) {
  return (
    <Document>
      <Page size="LETTER" style={cleanModernStyles.page}>
        {/* Header */}
        <View style={cleanModernStyles.header}>
          <Text style={cleanModernStyles.name}>{data.name || "Your Name"}</Text>
          {data.title && <Text style={cleanModernStyles.title}>{data.title}</Text>}
          <View style={cleanModernStyles.contactRow}>
            {data.contact.email && <Text style={cleanModernStyles.contactItem}>{data.contact.email}</Text>}
            {data.contact.phone && <Text style={cleanModernStyles.contactItem}>{data.contact.phone}</Text>}
            {data.contact.location && <Text style={cleanModernStyles.contactItem}>{data.contact.location}</Text>}
            {data.contact.linkedin && <Text style={cleanModernStyles.contactItem}>{data.contact.linkedin}</Text>}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={cleanModernStyles.section}>
            <Text style={cleanModernStyles.sectionTitle}>Professional Summary</Text>
            <Text style={cleanModernStyles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={cleanModernStyles.section}>
            <Text style={cleanModernStyles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={cleanModernStyles.expEntry}>
                <View style={cleanModernStyles.expHeader}>
                  <Text style={cleanModernStyles.expCompany}>{exp.company}</Text>
                  <Text style={cleanModernStyles.expDates}>{exp.dates}</Text>
                </View>
                <Text style={cleanModernStyles.expTitle}>{exp.title}</Text>
                {exp.bullets.map((bullet, j) => (
                  <Text key={j} style={cleanModernStyles.bullet}>• {bullet}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={cleanModernStyles.section}>
            <Text style={cleanModernStyles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={cleanModernStyles.eduEntry}>
                <Text style={cleanModernStyles.eduSchool}>{edu.school}</Text>
                <Text style={cleanModernStyles.eduDegree}>{edu.degree} {edu.dates && `| ${edu.dates}`}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={cleanModernStyles.section}>
            <Text style={cleanModernStyles.sectionTitle}>Skills</Text>
            <View style={cleanModernStyles.skillsContainer}>
              {data.skills.slice(0, 20).map((skill, i) => (
                <Text key={i} style={cleanModernStyles.skill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

// ============ EXECUTIVE TEMPLATE ============
const executiveStyles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 20,
  },
  name: {
    fontSize: 28,
    fontFamily: "Times-Bold",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontFamily: "Times-Italic",
    color: "#4a4a4a",
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  contactItem: {
    fontSize: 9,
    color: "#4a4a4a",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#999",
    paddingBottom: 4,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  expEntry: {
    marginBottom: 14,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  expCompany: {
    fontSize: 11,
    fontFamily: "Times-Bold",
  },
  expDates: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    color: "#4a4a4a",
  },
  expTitle: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    marginLeft: 15,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  eduEntry: {
    marginBottom: 8,
  },
  eduSchool: {
    fontSize: 11,
    fontFamily: "Times-Bold",
  },
  eduDegree: {
    fontSize: 10,
  },
  skillsText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
});

export function ExecutiveTemplate({ data }: { data: ParsedResume }) {
  return (
    <Document>
      <Page size="LETTER" style={executiveStyles.page}>
        <View style={executiveStyles.header}>
          <Text style={executiveStyles.name}>{data.name?.toUpperCase() || "YOUR NAME"}</Text>
          {data.title && <Text style={executiveStyles.title}>{data.title}</Text>}
          <View style={executiveStyles.contactRow}>
            {data.contact.email && <Text style={executiveStyles.contactItem}>{data.contact.email}</Text>}
            {data.contact.phone && <Text style={executiveStyles.contactItem}>{data.contact.phone}</Text>}
            {data.contact.location && <Text style={executiveStyles.contactItem}>{data.contact.location}</Text>}
          </View>
        </View>

        {data.summary && (
          <View style={executiveStyles.section}>
            <Text style={executiveStyles.sectionTitle}>Executive Summary</Text>
            <Text style={executiveStyles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={executiveStyles.section}>
            <Text style={executiveStyles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={executiveStyles.expEntry}>
                <View style={executiveStyles.expHeader}>
                  <Text style={executiveStyles.expCompany}>{exp.company}</Text>
                  <Text style={executiveStyles.expDates}>{exp.dates}</Text>
                </View>
                <Text style={executiveStyles.expTitle}>{exp.title}</Text>
                {exp.bullets.map((bullet, j) => (
                  <Text key={j} style={executiveStyles.bullet}>• {bullet}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={executiveStyles.section}>
            <Text style={executiveStyles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={executiveStyles.eduEntry}>
                <Text style={executiveStyles.eduSchool}>{edu.school}</Text>
                <Text style={executiveStyles.eduDegree}>{edu.degree}</Text>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={executiveStyles.section}>
            <Text style={executiveStyles.sectionTitle}>Core Competencies</Text>
            <Text style={executiveStyles.skillsText}>{data.skills.join(" • ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// ============ TECHNICAL TEMPLATE ============
const technicalStyles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Courier",
    fontSize: 9,
    color: "#222",
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    color: "#10b981",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactItem: {
    fontSize: 8,
    fontFamily: "Courier",
    color: "#666",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#f0fdf4",
    padding: "4 8",
    marginBottom: 8,
    color: "#166534",
  },
  summary: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  skillsSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  skillsTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#166534",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skill: {
    fontSize: 8,
    fontFamily: "Courier",
    backgroundColor: "#e2e8f0",
    padding: "3 6",
    borderRadius: 2,
  },
  expEntry: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  expCompany: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  expDates: {
    fontSize: 8,
    fontFamily: "Courier",
    color: "#666",
  },
  expTitle: {
    fontSize: 9,
    color: "#10b981",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 8,
    fontFamily: "Courier",
    marginLeft: 8,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  eduEntry: {
    marginBottom: 6,
  },
  eduSchool: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  eduDegree: {
    fontSize: 9,
  },
});

export function TechnicalTemplate({ data }: { data: ParsedResume }) {
  return (
    <Document>
      <Page size="LETTER" style={technicalStyles.page}>
        <View style={technicalStyles.header}>
          <Text style={technicalStyles.name}>{data.name || "Your Name"}</Text>
          {data.title && <Text style={technicalStyles.title}>{data.title}</Text>}
          <View style={technicalStyles.contactRow}>
            {data.contact.email && <Text style={technicalStyles.contactItem}>{data.contact.email}</Text>}
            {data.contact.phone && <Text style={technicalStyles.contactItem}>{data.contact.phone}</Text>}
            {data.contact.location && <Text style={technicalStyles.contactItem}>{data.contact.location}</Text>}
            {data.contact.linkedin && <Text style={technicalStyles.contactItem}>{data.contact.linkedin}</Text>}
          </View>
        </View>

        {/* Skills first for technical */}
        {data.skills.length > 0 && (
          <View style={technicalStyles.skillsSection}>
            <Text style={technicalStyles.skillsTitle}>TECHNICAL SKILLS</Text>
            <View style={technicalStyles.skillsGrid}>
              {data.skills.slice(0, 25).map((skill, i) => (
                <Text key={i} style={technicalStyles.skill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {data.summary && (
          <View style={technicalStyles.section}>
            <Text style={technicalStyles.sectionTitle}>SUMMARY</Text>
            <Text style={technicalStyles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={technicalStyles.section}>
            <Text style={technicalStyles.sectionTitle}>EXPERIENCE</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={technicalStyles.expEntry}>
                <View style={technicalStyles.expHeader}>
                  <Text style={technicalStyles.expCompany}>{exp.company}</Text>
                  <Text style={technicalStyles.expDates}>{exp.dates}</Text>
                </View>
                <Text style={technicalStyles.expTitle}>{exp.title}</Text>
                {exp.bullets.map((bullet, j) => (
                  <Text key={j} style={technicalStyles.bullet}>→ {bullet}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={technicalStyles.section}>
            <Text style={technicalStyles.sectionTitle}>EDUCATION</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={technicalStyles.eduEntry}>
                <Text style={technicalStyles.eduSchool}>{edu.school}</Text>
                <Text style={technicalStyles.eduDegree}>{edu.degree}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

// ============ CREATIVE TEMPLATE ============
const creativeStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#2d2d2d",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: "#8b5cf6",
  },
  header: {
    marginBottom: 20,
    paddingLeft: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8b5cf6",
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  contactItem: {
    fontSize: 9,
    color: "#6b7280",
  },
  content: {
    paddingLeft: 15,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8b5cf6",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#8b5cf6",
    borderBottomStyle: "dotted",
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#4b5563",
  },
  expEntry: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  expCompany: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  expDates: {
    fontSize: 9,
    color: "#8b5cf6",
    fontWeight: "bold",
  },
  expTitle: {
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 2,
    lineHeight: 1.5,
    color: "#4b5563",
  },
  eduEntry: {
    marginBottom: 8,
  },
  eduSchool: {
    fontSize: 11,
    fontWeight: "bold",
  },
  eduDegree: {
    fontSize: 10,
    color: "#6b7280",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skill: {
    fontSize: 9,
    backgroundColor: "#ede9fe",
    color: "#7c3aed",
    padding: "5 10",
    borderRadius: 12,
  },
});

export function CreativeTemplate({ data }: { data: ParsedResume }) {
  return (
    <Document>
      <Page size="LETTER" style={creativeStyles.page}>
        <View style={creativeStyles.sidebar} />
        
        <View style={creativeStyles.header}>
          <Text style={creativeStyles.name}>{data.name || "Your Name"}</Text>
          {data.title && <Text style={creativeStyles.title}>{data.title}</Text>}
          <View style={creativeStyles.contactRow}>
            {data.contact.email && <Text style={creativeStyles.contactItem}>✉ {data.contact.email}</Text>}
            {data.contact.phone && <Text style={creativeStyles.contactItem}>☎ {data.contact.phone}</Text>}
            {data.contact.location && <Text style={creativeStyles.contactItem}>◎ {data.contact.location}</Text>}
          </View>
        </View>

        <View style={creativeStyles.content}>
          {data.summary && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>About Me</Text>
              <Text style={creativeStyles.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experience.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>Experience</Text>
              {data.experience.map((exp, i) => (
                <View key={i} style={creativeStyles.expEntry}>
                  <View style={creativeStyles.expHeader}>
                    <Text style={creativeStyles.expCompany}>{exp.company}</Text>
                    <Text style={creativeStyles.expDates}>{exp.dates}</Text>
                  </View>
                  <Text style={creativeStyles.expTitle}>{exp.title}</Text>
                  {exp.bullets.map((bullet, j) => (
                    <Text key={j} style={creativeStyles.bullet}>◆ {bullet}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {data.skills.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>Skills & Expertise</Text>
              <View style={creativeStyles.skillsContainer}>
                {data.skills.slice(0, 15).map((skill, i) => (
                  <Text key={i} style={creativeStyles.skill}>{skill}</Text>
                ))}
              </View>
            </View>
          )}

          {data.education.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>Education</Text>
              {data.education.map((edu, i) => (
                <View key={i} style={creativeStyles.eduEntry}>
                  <Text style={creativeStyles.eduSchool}>{edu.school}</Text>
                  <Text style={creativeStyles.eduDegree}>{edu.degree}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// Template selector component
export function getTemplateComponent(template: ResumeTemplate) {
  switch (template) {
    case "executive":
      return ExecutiveTemplate;
    case "technical":
      return TechnicalTemplate;
    case "creative":
      return CreativeTemplate;
    case "clean-modern":
    default:
      return CleanModernTemplate;
  }
}

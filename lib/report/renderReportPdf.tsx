import { Document, Page, Text, View, Link, StyleSheet, Font } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";

Font.register({
  family: "Times",
  fonts: [{ src: "https://fonts.gstatic.com/s/tinos/v23/buE4poGnedXvwjX_fm1Z.ttf" }]
});

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Times", color: "#0f172a" },
  header: { marginBottom: 16 },
  brand: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#64748b" },
  heading: { fontSize: 22, marginTop: 4 },
  subheading: { fontSize: 14, marginTop: 14, marginBottom: 6 },
  text: { fontSize: 11, lineHeight: 1.4 },
  tocItem: { fontSize: 10, color: "#475569", marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e2e8f0", paddingVertical: 6 },
  cellTitle: { flex: 3, fontSize: 11 },
  cellScore: { flex: 1, fontSize: 11, textAlign: "right" },
  badge: { borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6, fontSize: 9 },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, fontSize: 9, color: "#94a3b8" }
});

export type ReportJob = {
  title: string;
  company_name: string;
  fit_score: number;
  ghost_risk_score: number;
  apply_url?: string | null;
  recommended_apply_path?: string | null;
  short_summary?: string | null;
};

export async function renderReportPdf(payload: {
  candidateName: string;
  summary: string;
  jobs: ReportJob[];
  gaps: string[];
  certs: string[];
  outreach: string;
  includeResume?: boolean;
  patchNotes?: string;
  keywordMap?: string[];
}) {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  const toc = [
    "Candidate Snapshot",
    payload.includeResume ? "ATS Resume" : null,
    payload.patchNotes ? "Resume Patch Notes" : null,
    `Top ${payload.jobs.length} Urgently Hiring Jobs`,
    payload.keywordMap?.length ? "Keyword Map" : null,
    payload.gaps.length ? "Skill Gaps + Fixes" : null,
    payload.certs.length ? "Certifications" : null,
    "Outreach Pack"
  ].filter(Boolean) as string[];

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>C&L Job Match — Offer Farming Report</Text>
          <Text style={styles.heading}>{payload.candidateName}</Text>
          <Text style={styles.text}>Generated {generatedAt}</Text>
        </View>

        <Text style={styles.subheading}>Table of contents</Text>
        {toc.map((item) => (
          <Text key={item} style={styles.tocItem}>• {item}</Text>
        ))}

        <Text style={styles.subheading}>Candidate Snapshot</Text>
        <Text style={styles.text}>{payload.summary}</Text>

        {payload.includeResume ? (
          <>
            <Text style={styles.subheading}>ATS Resume</Text>
            <Text style={styles.text}>
              Your ATS-optimized resume is included as a separate PDF + DOCX for clean submissions.
            </Text>
          </>
        ) : null}

        {payload.patchNotes ? (
          <>
            <Text style={styles.subheading}>Resume Patch Notes</Text>
            {payload.patchNotes.split("\n").map((line, index) => (
              <Text key={`${line}-${index}`} style={styles.text}>
                {line}
              </Text>
            ))}
          </>
        ) : null}

        <Text style={styles.subheading}>Top {payload.jobs.length} Urgently Hiring Jobs</Text>
        {payload.jobs.map((job) => (
          <View key={`${job.company_name}-${job.title}`} style={styles.tableRow}>
            <View style={styles.cellTitle}>
              <Text>{job.title} — {job.company_name}</Text>
              {job.apply_url ? (
                <Link src={job.apply_url} style={{ fontSize: 10, color: "#2563eb" }}>
                  Open role
                </Link>
              ) : null}
              {job.recommended_apply_path ? (
                <Text style={{ fontSize: 9, color: "#64748b" }}>
                  Apply path: {job.recommended_apply_path}
                </Text>
              ) : null}
              {job.short_summary ? (
                <Text style={{ fontSize: 9 }}>{job.short_summary}</Text>
              ) : null}
            </View>
            <View style={styles.cellScore}>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.badge, { backgroundColor: "#e2e8f0", marginBottom: 4 }]}>
                  Fit {job.fit_score}
                </Text>
                <Text style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
                  Ghost {job.ghost_risk_score}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {payload.keywordMap?.length ? (
          <>
            <Text style={styles.subheading}>Keyword Map</Text>
            {payload.keywordMap.map((keyword) => (
              <Text key={keyword} style={styles.text}>• {keyword}</Text>
            ))}
          </>
        ) : null}

        {payload.gaps.length ? (
          <>
            <Text style={styles.subheading}>Skill Gaps + Fixes</Text>
            {payload.gaps.map((gap) => (
              <Text key={gap} style={styles.text}>• {gap}</Text>
            ))}
          </>
        ) : null}

        {payload.certs.length ? (
          <>
            <Text style={styles.subheading}>Certifications</Text>
            {payload.certs.map((cert) => (
              <Text key={cert} style={styles.text}>• {cert}</Text>
            ))}
          </>
        ) : null}

        <Text style={styles.subheading}>Outreach Pack</Text>
        <Text style={styles.text}>{payload.outreach || "Outreach is not included in this tier."}</Text>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `C&L Job Match • Confidential • Page ${pageNumber} of ${totalPages} • Generated ${generatedAt}`
          }
        />
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

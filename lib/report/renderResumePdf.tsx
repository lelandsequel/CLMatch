import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, lineHeight: 1.4, fontFamily: "Times" },
  heading: { fontSize: 18, marginBottom: 6 },
  section: { marginBottom: 10 }
});

export async function renderResumePdf(payload: { fullName: string; content: string }) {
  const lines = payload.content.split("\n").map((line) => line.trim()).filter(Boolean);
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>{payload.fullName}</Text>
        <View style={styles.section}>
          {lines.map((line, index) => (
            <Text key={`${line}-${index}`}>{line}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

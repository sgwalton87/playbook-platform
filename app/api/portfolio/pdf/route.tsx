import { NextRequest } from "next/server";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    color: "#0F172A",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 20,
  },
  section: {
    marginTop: 16,
    paddingTop: 10,
    borderTop: "1px solid #E2E8F0",
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  body: {
    lineHeight: 1.5,
  },
});

function PortfolioDocument({
  scholarName,
  targetUse,
  resume,
  bragSheet,
  recommendationLetter,
}: {
  scholarName: string;
  targetUse: string;
  resume: any;
  bragSheet: any;
  recommendationLetter?: string;
}) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{scholarName} Portfolio Packet</Text>
        <Text style={styles.subtitle}>Target use: {targetUse}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <Text style={styles.body}>{JSON.stringify(resume, null, 2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brag Sheet</Text>
          <Text style={styles.body}>{JSON.stringify(bragSheet, null, 2)}</Text>
        </View>

        {recommendationLetter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendation Letter</Text>
            <Text style={styles.body}>{recommendationLetter}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const scholarName = body.scholarName || "Scholar";

  const buffer = await renderToBuffer(
    <PortfolioDocument
      scholarName={scholarName}
      targetUse={body.targetUse || "application"}
      resume={body.resume || {}}
      bragSheet={body.bragSheet || {}}
      recommendationLetter={body.recommendationLetter}
    />
  );

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${scholarName.replaceAll(" ", "_")}_Portfolio.pdf"`,
    },
  });
}

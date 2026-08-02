import { NextRequest } from "next/server";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildServerPortfolioPacket, normalizePacketSections } from "@/lib/portfolio/server";

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

type PortfolioPdfRequestBody = {
  targetUse?: string;
  sections?: unknown;
};

function PortfolioDocument({
  scholarName,
  targetUse,
  packet,
}: {
  scholarName: string;
  targetUse: string;
  packet: Record<string, unknown>;
}) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{scholarName} Portfolio Packet</Text>
        <Text style={styles.subtitle}>Target use: {targetUse}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allowlisted Portfolio Data</Text>
          <Text style={styles.body}>{JSON.stringify(packet, null, 2)}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = (await req.json()) as PortfolioPdfRequestBody;
  const sections = normalizePacketSections(body.sections);
  if (sections.length === 0) return Response.json({ error: "At least one allowlisted section is required." }, { status: 422 });
  const built = await buildServerPortfolioPacket({ supabase, scholarId: auth.user.id, targetUse: body.targetUse || "application", sections });
  if (!built.ok) return Response.json({ error: built.error }, { status: 409 });
  const scholarName = built.scholarName;

  const buffer = await renderToBuffer(
    <PortfolioDocument
      scholarName={scholarName}
      targetUse={body.targetUse || "application"}
      packet={built.packet}
    />
  );

  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${scholarName.replaceAll(" ", "_")}_Portfolio.pdf"`,
    },
  });
}

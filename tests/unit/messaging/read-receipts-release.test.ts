import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflowBoundary = readFileSync("supabase/tests/messaging_revocation_attachment_preflight.sql", "utf8");
const receiptPreflight = readFileSync("supabase/tests/messaging_read_receipts_preflight.sql", "utf8");

describe("Read Receipts release wiring", () => {
  it("runs the dedicated receipt preflight inside the full Messaging database boundary", () => {
    expect(workflowBoundary).toContain("messaging_read_receipts_preflight.sql");
    expect(receiptPreflight).toContain("public.mark_governed_conversation_read");
    expect(receiptPreflight).toContain("public.get_governed_message_read_receipts");
  });
});

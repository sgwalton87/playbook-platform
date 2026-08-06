import { describe, expect, it } from "vitest";
import { SignedPlaybookPbosTransport } from "./signed-server-transport";

const credentials = {
  organizationId: "PLAYBOOK-ORG-001",
  connectorId: "PLAYBOOK-CONNECTOR-001",
  keyId: "playbook-key-001",
  secretBase64: Buffer.alloc(32, 7).toString("base64")
};

describe("signed Playbook PBOS transport", () => {
  it("preserves structured PBOS rejection evidence instead of masking HTTP 400", async () => {
    const fetcher = async () => new Response(JSON.stringify({
      success: false,
      apiVersion: "v1",
      correlationId: "identity-correlation",
      error: { code: "CONFLICT", message: "Identity mapping already registered with different authority context." }
    }), { status: 400, headers: { "content-type": "application/json" } });
    const transport = new SignedPlaybookPbosTransport("https://pbos.example.com/pbos/v1", credentials,
      fetcher as typeof fetch);
    await expect(transport.send({ apiVersion: "v1", operation: "REGISTER_IDENTITY",
      correlationId: "identity-correlation", payload: {} })).resolves.toMatchObject({
        success: false,
        error: { code: "CONFLICT", message: "Identity mapping already registered with different authority context." }
      });
  });
});

import { describe, expect, it } from "vitest";
import { PbosRuntimeUnavailableError, SignedPlaybookPbosTransport } from "./signed-server-transport";

const credentials = {
  organizationId: "PLAYBOOK-ORG-001",
  connectorId: "PLAYBOOK-CONNECTOR-001",
  keyId: "playbook-key-001",
  secretBase64: Buffer.alloc(32, 7).toString("base64")
};

describe("signed Playbook PBOS transport", () => {
  const request = { apiVersion: "v1" as const, operation: "REGISTER_IDENTITY" as const,
    correlationId: "identity-correlation", payload: {} };

  it.each([502, 503, 504])("classifies HTTP %i as a recoverable outage", async status => {
    const transport = new SignedPlaybookPbosTransport("https://pbos.example.com/pbos/v1", credentials,
      (async () => new Response("Unavailable", { status })) as typeof fetch);
    await expect(transport.send(request)).rejects.toBeInstanceOf(PbosRuntimeUnavailableError);
  });

  it("classifies a network failure without exposing its internal message", async () => {
    const transport = new SignedPlaybookPbosTransport("https://pbos.example.com/pbos/v1", credentials,
      (async () => { throw new TypeError("private network detail"); }) as typeof fetch);
    await expect(transport.send(request)).rejects.toThrow("PBOS activation is temporarily unavailable.");
  });

  it.each([400, 401, 403, 409, 500])("does not turn HTTP %i into successful pending activation", async status => {
    const transport = new SignedPlaybookPbosTransport("https://pbos.example.com/pbos/v1", credentials,
      (async () => new Response("Rejected", { status })) as typeof fetch);
    await expect(transport.send(request)).rejects.not.toBeInstanceOf(PbosRuntimeUnavailableError);
  });

  it("keeps a response correlation mismatch nonrecoverable", async () => {
    const transport = new SignedPlaybookPbosTransport("https://pbos.example.com/pbos/v1", credentials,
      (async () => Response.json({ success: true, correlationId: "wrong" })) as typeof fetch);
    await expect(transport.send(request)).rejects.toThrow("correlation mismatch");
  });

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

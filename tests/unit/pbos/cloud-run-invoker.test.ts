import { describe, expect, it, vi } from "vitest";
import { getProductionPbosIdToken, verifyProductionPbosInvocationTarget } from "@/lib/pbos/cloud-run-invoker";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

const audience = "https://pbos-v1-integration-production-example.run.app";
const endpoint = audience + "/pbos/v1";
const environment = {
  PBOS_GCP_WIF_PROVIDER: "//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/pbos-playbook-production/providers/vercel",
  PBOS_GCP_INVOKER_SERVICE_ACCOUNT: "pbos-playbook-invoker@pbos-production-fixture.iam.gserviceaccount.com",
  PBOS_CLOUD_RUN_AUDIENCE: audience,
};

describe("production Cloud Run invocation", () => {
  it("exchanges Vercel identity with Google and binds the invocation token to Cloud Run", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ access_token: "federated-fixture" }))
      .mockResolvedValueOnce(Response.json({ token: "invoker-fixture" }));
    await expect(getProductionPbosIdToken(environment, fetcher, async () => "vercel-fixture")).resolves.toBe("invoker-fixture");
    expect(fetcher.mock.calls[0][0]).toBe("https://sts.googleapis.com/v1/token");
    expect(fetcher.mock.calls[0][1]?.redirect).toBe("error");
    expect(new URLSearchParams(String(fetcher.mock.calls[0][1]?.body)).get("audience")).toBe(environment.PBOS_GCP_WIF_PROVIDER);
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).toEqual({ audience, includeEmail: true });
  });

  it("rejects unexpected endpoints and authentication failures", async () => {
    expect(() => verifyProductionPbosInvocationTarget(endpoint, environment)).not.toThrow();
    expect(() => verifyProductionPbosInvocationTarget("https://other.run.app/pbos/v1", environment)).toThrow(/approved Cloud Run audience/);
    expect(() => verifyProductionPbosInvocationTarget(endpoint, { ...environment, PBOS_CLOUD_RUN_AUDIENCE: "https://pbos-staging.run.app" })).toThrow(/invalid/);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: "provider detail" }, { status: 403 }));
    await expect(getProductionPbosIdToken(environment, fetcher, async () => "fixture")).rejects.toThrow("Google denied Playbook workload federation.");
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("retains the PBOS HMAC alongside Google IAM and stops if IAM token acquisition fails", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ apiVersion: "v1", success: true,
      correlationId: "fixture", output: {}, provenance: [] }));
    const credentials = { organizationId: "fixture", connectorId: "fixture", keyId: "fixture", secretBase64: Buffer.alloc(32).toString("base64") };
    const request = { apiVersion: "v1" as const, operation: "HEALTH_CHECK" as const, correlationId: "fixture", payload: {} };
    const token = vi.fn<() => Promise<string>>().mockResolvedValueOnce("invocation-fixture").mockRejectedValueOnce(new Error("denied"));
    const transport = new SignedPlaybookPbosTransport(endpoint, credentials, fetcher, token);
    await transport.send(request);
    await expect(transport.send(request)).rejects.toThrow("denied");
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: "Bearer invocation-fixture",
      "x-pbos-signature": expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });
});

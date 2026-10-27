import { createHash, createHmac, randomUUID } from "crypto";
import type { PbosRequest, PbosResponse, PbosTransport } from "./contracts";

export interface PlaybookServerCredentials { organizationId: string; connectorId: string; keyId: string; secretBase64: string }

/** Only transport outages are recoverable; authorization and protocol failures are not. */
export class PbosRuntimeUnavailableError extends Error {
  constructor() {
    super("PBOS activation is temporarily unavailable.");
    this.name = "PbosRuntimeUnavailableError";
  }
}

export class SignedPlaybookPbosTransport implements PbosTransport {
  constructor(private readonly endpoint: string, private readonly credentials: PlaybookServerCredentials, private readonly fetcher: typeof fetch = fetch) {
    if (!endpoint || !credentials.organizationId || !credentials.connectorId || !credentials.keyId || !credentials.secretBase64) {
      throw new Error("Complete server-only PBOS connector configuration is required.");
    }
  }

  async send<T>(request: PbosRequest): Promise<PbosResponse<T>> {
    const body = JSON.stringify(request);
    const timestamp = new Date().toISOString();
    const nonce = randomUUID();
    const path = new URL(this.endpoint).pathname;
    const digest = createHash("sha256").update(body).digest("hex");
    const canonical = ["POST", path, this.credentials.organizationId, this.credentials.connectorId,
      this.credentials.keyId, timestamp, nonce, digest].join("\n");
    const signature = createHmac("sha256", Buffer.from(this.credentials.secretBase64, "base64")).update(canonical).digest("hex");
    let response: Response;
    try {
      response = await this.fetcher(this.endpoint, { method: "POST", cache: "no-store", body, headers: {
      "content-type": "application/json", "x-pbos-api-version": "v1", "x-pbos-organization-id": this.credentials.organizationId,
      "x-pbos-connector-id": this.credentials.connectorId, "x-pbos-key-id": this.credentials.keyId,
      "x-pbos-timestamp": timestamp, "x-pbos-nonce": nonce, "x-pbos-signature": signature
    }, signal: AbortSignal.timeout(15_000) });
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error &&
          ["AbortError", "TimeoutError"].includes(error.name))) {
        throw new PbosRuntimeUnavailableError();
      }
      throw error;
    }
    if ([502, 503, 504].includes(response.status)) {
      throw new PbosRuntimeUnavailableError();
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error("PBOS v1 transport returned non-JSON HTTP " + response.status + ".");
    }
    const result = await response.json() as PbosResponse<T> | { error?: unknown };
    if (!("success" in result)) {
      const detail = typeof result.error === "string" ? result.error : "PBOS request rejected.";
      throw new Error(detail + " (HTTP " + response.status + ").");
    }
    if (result.correlationId !== request.correlationId) throw new Error("PBOS v1 response correlation mismatch.");
    // A malformed or contradictory transport envelope must never certify authority.
    if (result.apiVersion !== "v1" || typeof result.success !== "boolean") {
      throw new Error("PBOS v1 response contract mismatch.");
    }
    if (result.success) {
      if (!response.ok || !("output" in result) || !Array.isArray(result.provenance) ||
          !result.provenance.every(value => typeof value === "string")) {
        throw new Error("PBOS v1 success envelope invalid.");
      }
    } else if (!("error" in result) || !result.error || typeof result.error !== "object" ||
        typeof result.error.code !== "string" || typeof result.error.message !== "string") {
      throw new Error("PBOS v1 rejection envelope invalid.");
    }
    return result as PbosResponse<T>;
  }
}

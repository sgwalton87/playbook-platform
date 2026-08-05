import { createHash, createHmac, randomUUID } from "crypto";
import type { PbosRequest, PbosResponse, PbosTransport } from "./contracts";

export interface PlaybookServerCredentials { organizationId: string; connectorId: string; keyId: string; secretBase64: string }

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
    const response = await this.fetcher(this.endpoint, { method: "POST", cache: "no-store", body, headers: {
      "content-type": "application/json", "x-pbos-api-version": "v1", "x-pbos-organization-id": this.credentials.organizationId,
      "x-pbos-connector-id": this.credentials.connectorId, "x-pbos-key-id": this.credentials.keyId,
      "x-pbos-timestamp": timestamp, "x-pbos-nonce": nonce, "x-pbos-signature": signature
    } });
    return await response.json() as PbosResponse<T>;
  }
}

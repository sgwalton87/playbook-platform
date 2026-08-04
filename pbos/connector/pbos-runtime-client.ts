import { PbosOperation, PbosResponse, PbosTransport } from "./contracts";

export class PlaybookPbosRuntimeClient {
    constructor(private readonly transport: PbosTransport) {}

    send<T>(operation: PbosOperation, payload: unknown, correlationId: string, idempotencyKey?: string): Promise<PbosResponse<T>> {
        if (!correlationId) throw new Error("Playbook PBOS requests require a correlation ID.");
        return this.transport.send<T>({ apiVersion: "v1", operation, payload, correlationId, idempotencyKey });
    }
}

export class PlaybookPbosHttpTransport implements PbosTransport {
    constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch) {
        if (!endpoint) throw new Error("PBOS API endpoint is required.");
    }

    async send<T>(request: Parameters<PbosTransport["send"]>[0]): Promise<PbosResponse<T>> {
        const response = await this.fetcher(this.endpoint, {
            method: "POST",
            headers: { "content-type": "application/json", "x-pbos-api-version": "v1" },
            body: JSON.stringify(request),
            cache: "no-store"
        });
        return await response.json() as PbosResponse<T>;
    }
}

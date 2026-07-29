import { describe, expect, it } from "vitest";
import {
  decodeExecutionAuthorization,
  decodeExecutionContract,
  decodeVolumeCertificationArtifact,
} from "./artifact-decoders";

describe("runtime artifact decoders", () => {
  it("rejects an incomplete authorization before lifecycle mutation", () => {
    expect(() =>
      decodeExecutionAuthorization({
        id: "AUTH-1",
        status: "AUTHORIZED",
      })
    ).toThrow("Execution authorization runtime artifact failed schema validation.");
  });

  it("rejects malformed immutable execution contracts", () => {
    expect(() =>
      decodeExecutionContract({
        id: "CONTRACT-1",
        version: "1.0.0",
        gateId: "GATE-1",
        authorization: "AUTHORIZED",
      })
    ).toThrow("Execution contract runtime artifact failed schema validation.");
  });

  it("rejects certification history with the wrong canonical owner", () => {
    expect(() =>
      decodeVolumeCertificationArtifact({
        schemaVersion: 1,
        owner: "unknown",
        latest: {},
        history: [],
      })
    ).toThrow("Volume certification runtime artifact failed schema validation.");
  });
});

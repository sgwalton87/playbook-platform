import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getMissingPbosActivationConfiguration } from "@/lib/pbos/activation-config";

const runtime = {
  PBOS_API_URL: "https://pbos.example/pbos/v1",
  PBOS_ORGANIZATION_ID: "PLAYBOOK-ORG-001",
  PBOS_CONNECTOR_ID: "connector",
  PBOS_CONNECTOR_KEY_ID: "key",
  PBOS_CONNECTOR_SECRET_BASE64: "secret",
};

describe("PBOS activation configuration", () => {
  it("reports the complete Scholar activation requirement without exposing values", () => {
    expect(getMissingPbosActivationConfiguration("SCHOLAR", {})).toEqual([
      "PBOS_API_URL",
      "PBOS_ORGANIZATION_ID",
      "PBOS_CONNECTOR_ID",
      "PBOS_CONNECTOR_KEY_ID",
      "PBOS_CONNECTOR_SECRET_BASE64",
      "PBOS_SCHOLAR_IDENTITY_APPROVAL_ID",
      "PBOS_SCHOLAR_EXCHANGE_APPROVAL_ID",
    ]);
  });

  it("accepts a complete Scholar configuration", () => {
    expect(getMissingPbosActivationConfiguration("SCHOLAR", {
      ...runtime,
      PBOS_SCHOLAR_IDENTITY_APPROVAL_ID: "identity",
      PBOS_SCHOLAR_EXCHANGE_APPROVAL_ID: "exchange",
    })).toEqual([]);
  });

  it("checks role-specific Scholar-Athlete approvals", () => {
    expect(getMissingPbosActivationConfiguration("SCHOLAR_ATHLETE", runtime)).toEqual([
      "PBOS_SCHOLAR_ATHLETE_IDENTITY_APPROVAL_ID",
      "PBOS_SCHOLAR_ATHLETE_EXCHANGE_APPROVAL_ID",
    ]);
  });

  it("treats blank configuration as missing", () => {
    expect(getMissingPbosActivationConfiguration("TRANSITION_YOUTH", {
      ...runtime,
      PBOS_API_URL: "  ",
      PBOS_TRANSITION_YOUTH_IDENTITY_APPROVAL_ID: "identity",
      PBOS_TRANSITION_YOUTH_EXCHANGE_APPROVAL_ID: "exchange",
    })).toEqual(["PBOS_API_URL"]);
  });

  it("logs missing configuration key names only on the server", () => {
    const route = fs.readFileSync(
      path.join(process.cwd(), "app/api/pbos/scholar/onboarding/route.ts"),
      "utf8"
    );
    const diagnosticStart = route.indexOf('console.error("[PBOS_ACTIVATION_CONFIG_MISSING]"');
    const diagnosticEnd = route.indexOf("});", diagnosticStart);
    expect(diagnosticStart).toBeGreaterThan(-1);
    expect(diagnosticEnd).toBeGreaterThan(diagnosticStart);
    const diagnostic = route.slice(diagnosticStart, diagnosticEnd);
    expect(diagnostic).toContain("missingKeys: missingActivationConfiguration");
    expect(diagnostic).toContain("role: pbosRole");
    expect(diagnostic).not.toContain("process.env");
    expect(diagnostic).not.toContain("required(");
    expect(diagnostic).not.toContain("secretBase64");
  });

  it("emits a sanitized signal when the PBOS transport is unavailable", () => {
    const route = fs.readFileSync(
      path.join(process.cwd(), "app/api/pbos/scholar/onboarding/route.ts"),
      "utf8"
    );
    const start = route.indexOf('console.error("[PBOS_ACTIVATION_RUNTIME_UNAVAILABLE]"');
    expect(start).toBeGreaterThan(-1);
    const statement = route.slice(start, route.indexOf(";", start));
    expect(statement).toContain("role: pbosRole");
    expect(statement).not.toContain("user.id");
    expect(statement).not.toContain("secret");
    expect(statement).not.toContain("error.message");
  });

  it("completes the governed profile before returning pending activation", () => {
    const route = fs.readFileSync(
      path.join(process.cwd(), "app/api/pbos/scholar/onboarding/route.ts"),
      "utf8"
    );
    const configurationCheck = route.indexOf("getMissingPbosActivationConfiguration(pbosRole)");
    const governedCompletion = route.indexOf("const completedAt = await finalizeProfileCompletion(", configurationCheck);
    const connectorConstruction = route.indexOf("const connector = new PlaybookConnector(");

    expect(configurationCheck).toBeGreaterThan(-1);
    expect(governedCompletion).toBeGreaterThan(configurationCheck);
    expect(connectorConstruction).toBeGreaterThan(governedCompletion);
    expect(route).toContain('activationState: "pending-pbos-activation"');
    expect(route).toContain("{ status: 202 }");
    expect(route).toContain("grants no additional authority");
  });
});

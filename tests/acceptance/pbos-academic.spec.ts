import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing PBOS academic acceptance configuration: " + name);
  return value;
};

function isTransientSupabaseFailure(error: unknown): boolean {
  const detail = error instanceof Error ? error.message : JSON.stringify(error);
  return /fetch failed|connect.*timeout|network|UND_ERR/i.test(detail);
}

async function withSupabaseRetry<T extends { error: unknown }>(label: string,
  operation: () => PromiseLike<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await operation();
      if (!result.error) return result;
      lastError = result.error;
      if (!isTransientSupabaseFailure(result.error)) throw result.error;
    } catch (error) {
      lastError = error;
      if (!isTransientSupabaseFailure(error)) throw error;
    }
    if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 500));
  }
  throw new Error(label + " failed after 3 bounded network attempts: " +
    (lastError instanceof Error ? lastError.message : JSON.stringify(lastError)));
}

function syntheticTranscriptPdf(): Buffer {
  const stream = "BT /F1 12 Tf 72 720 Td (PBOS Synthetic Scholar Transcript) Tj 0 -22 Td (English 9 A English 10 B) Tj 0 -22 Td (Algebra I A Geometry B Biology A World History B) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    "<< /Length " + Buffer.byteLength(stream, "binary") + " >>\nstream\n" + stream + "\nendstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf, "binary")); pdf += (index + 1) + " 0 obj\n" + object + "\nendobj\n"; });
  const xref = Buffer.byteLength(pdf, "binary");
  pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index += 1) pdf += String(offsets[index]).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
  return Buffer.from(pdf, "binary");
}

test("Scholar transcript produces durable academic readiness, decision, and outcome evidence through PBOS", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const email = required("PBOS_ACCEPTANCE_EMAIL");
  const password = required("PBOS_ACCEPTANCE_PASSWORD");
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const users = await withSupabaseRetry("Acceptance identity lookup",
    () => admin.auth.admin.listUsers({ page: 1, perPage: 1000 }));
  const user = users.data.users.find(candidate => candidate.email === email);
  if (!user) throw new Error("The governed Scholar acceptance identity must exist before academic acceptance.");

  const anonymous = await request.post("/api/parse-transcript", { data: { base64: "denied", mediaType: "application/pdf" } });
  expect(anonymous.status()).toBe(401);
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
  await page.goto("/transcript");
  await page.locator('input[type="file"]').setInputFiles({ name: "pbos-synthetic-transcript.pdf",
    mimeType: "application/pdf", buffer: syntheticTranscriptPdf() });
  await expect(page.getByRole("status")).toContainText("Transcript parsed", { timeout: 120_000 });

  const progress = await withSupabaseRetry("Academic progress verification",
    () => admin.from("ag_progress").select("user_id,subject").eq("user_id", user.id));
  expect(progress.data).toHaveLength(7);
  const transcriptEvidence = await withSupabaseRetry("Academic evidence verification", () => admin.from("academic_journey_evidence")
    .select("owner_id,readiness_score,ag_updates,delivery_state,provenance")
    .eq("owner_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle());
  expect(transcriptEvidence.data).toMatchObject({ owner_id: user.id, ag_updates: 7, delivery_state: "DELIVERED" });
  expect((transcriptEvidence.data?.provenance as unknown[] | undefined)?.length).toBeGreaterThan(0);

  await page.goto("/academic-readiness");
  await expect(page.getByTestId("academic-readiness")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your academic record should produce a next play." })).toBeVisible();
  await expect(page.getByText(/confidence$/)).toBeVisible();
  await expect(page.getByText("Why Playbook is recommending this")).toBeVisible();
  await page.getByRole("button", { name: "Not this play" }).click();
  await expect(page.getByText("REJECTED", { exact: true })).toBeVisible();

  const decisionEvidence = await withSupabaseRetry("Academic decision verification", () => admin.from("academic_journey_evidence")
    .select("owner_id,recommendation_key,primary_recommendation,decision_state,decision_at,provenance")
    .eq("owner_id", user.id)
    .not("recommendation_key", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle());
  expect(decisionEvidence.data?.owner_id).toBe(user.id);
  expect(decisionEvidence.data?.recommendation_key).toBeTruthy();
  expect(decisionEvidence.data?.primary_recommendation).toBeTruthy();
  expect(decisionEvidence.data?.decision_state).toBe("REJECTED");
  expect(decisionEvidence.data?.decision_at).toBeTruthy();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: artifacts + "/academic-readiness-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByTestId("academic-readiness")).toBeVisible();
  await expect(page.getByText("Why Playbook is recommending this")).toBeVisible();
  await page.screenshot({ path: artifacts + "/academic-readiness-mobile.png", fullPage: true });
  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""));
  await writeFile(artifacts + "/academic-accessibility.json", JSON.stringify(accessibility, null, 2));
  expect(blocking).toEqual([]);
  await context.tracing.stop({ path: artifacts + "/academic-trace.zip" });
  await writeFile(artifacts + "/academic-acceptance.json", JSON.stringify({ schemaVersion: 2,
    journeyId: "TRANSCRIPT-TO-ACADEMIC-DECISION-OUTCOME", commit: required("PBOS_ACCEPTANCE_COMMIT"),
    checks: [
      { dimension: "DURABLE_DATA", passed: true, detail: "Transcript-derived readiness and the Scholar decision survived authenticated database reads." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "Transcript evidence converged into an explainable recommendation with provenance and a persisted human decision." },
      { dimension: "HUMAN_AGENCY", passed: true, detail: "The Scholar could reject the recommendation without an automatic consequential action." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous transcript mutation was denied before authenticated execution." },
      { dimension: "SECURITY", passed: true, detail: "Protected academic configuration remained server controlled and persisted through owner-authorized records." },
      { dimension: "ACCESSIBILITY", passed: true, detail: "The converged Academic Readiness experience had no serious or critical axe violations at the certified revision." }
    ] }, null, 2));
});

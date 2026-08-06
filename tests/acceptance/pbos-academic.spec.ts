import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing PBOS academic acceptance configuration: " + name);
  return value;
};

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

test("Scholar transcript produces durable academic readiness through PBOS", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const email = required("PBOS_ACCEPTANCE_EMAIL");
  const password = required("PBOS_ACCEPTANCE_PASSWORD");
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
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

  const progress = await admin.from("ag_progress").select("user_id,subject").eq("user_id", user.id);
  if (progress.error) throw progress.error;
  expect(progress.data).toHaveLength(7);
  const evidence = await admin.from("academic_journey_evidence")
    .select("owner_id,readiness_score,ag_updates,delivery_state,provenance")
    .eq("owner_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (evidence.error) throw evidence.error;
  expect(evidence.data).toMatchObject({ owner_id: user.id, ag_updates: 7, delivery_state: "DELIVERED" });
  expect((evidence.data?.provenance as string[] | undefined)?.length).toBeGreaterThan(0);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: artifacts + "/academic-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole("button", { name: "Upload Transcript" })).toBeVisible();
  await page.screenshot({ path: artifacts + "/academic-mobile.png", fullPage: true });
  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""));
  await writeFile(artifacts + "/academic-accessibility.json", JSON.stringify(accessibility, null, 2));
  expect(blocking).toEqual([]);
  await context.tracing.stop({ path: artifacts + "/academic-trace.zip" });
  await writeFile(artifacts + "/academic-acceptance.json", JSON.stringify({ schemaVersion: 1,
    journeyId: "TRANSCRIPT-TO-ACADEMIC-READINESS", commit: required("PBOS_ACCEPTANCE_COMMIT"),
    checks: ["AUTHORITY", "DURABLE_DATA", "PBOS_INTEGRATION", "ACCESSIBILITY", "SECURITY"] }, null, 2));
});

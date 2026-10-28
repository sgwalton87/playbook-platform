import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import EmailDirectory from "@/components/founder/EmailDirectory";
import { emailDirectory } from "@/lib/email/directory";
import { playbookEmails } from "@/lib/email/emailConfig";
import { brandReviewDueAt, presentBrandDocument } from "@/lib/brand-verification/documents";
afterEach(cleanup);
describe("Command Center mailbox directory", () => {
  it("includes each requested address with a distinct purpose and configured sender key", () => {
    expect(emailDirectory).toHaveLength(10);
    expect(new Set(emailDirectory.map(row => row.address.toLowerCase())).size).toBe(10);
    expect(emailDirectory.map(row => row.address)).toEqual([
      "sycoywalton@playbookseriesinc.org", "vycoywalton@playbookseriesinc.org", "noreply@playbookseriesinc.org", "LOR@playbookseriesinc.org", "hello@playbookseriesinc.org", "brandpartners@playbookseriesinc.org", "Parents@playbookseriesinc.org", "support@playbookseriesinc.org", "onboarding@playbookseriesinc.org", "notifications@playbookseriesinc.org",
    ]);
    for (const row of emailDirectory) { expect(playbookEmails[row.key]).toBe(row.address); expect(row.purpose.length).toBeGreaterThan(20); }
  });
  it("shows the verification inbox and its purpose in the Command Center", () => {
    render(<EmailDirectory />);
    expect(screen.getByRole("heading", { name: "Playbook email directory" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "onboarding@playbookseriesinc.org" }).getAttribute("href")).toBe("mailto:onboarding@playbookseriesinc.org");
    expect(screen.getByText(/Account onboarding and Brand Partner/)).toBeTruthy();
  });
  it("treats 72 hours as a review target and does not put expiry tokens on admin URLs", () => {
    expect(brandReviewDueAt("2026-10-28T18:00:00Z")).toBe("2026-10-31T18:00:00.000Z");
    expect(brandReviewDueAt(null)).toBeNull();
    expect(brandReviewDueAt("invalid")).toBeNull();
    const doc = presentBrandDocument({ document_id: "example", storage_path: "owner/letterhead-example.pdf", document_type: "Company letterhead", uploaded_at: "2020-01-01", request_id: null, organization_name: null, verification_status: null, submitted_at: null, archived_at: null, archive_reason: null });
    expect(doc.url).toBe("/api/admin/verification/brand-evidence/file?documentId=example");
    expect(doc.url).not.toContain("token");
    expect(doc).not.toHaveProperty("expiresAt");
  });
});

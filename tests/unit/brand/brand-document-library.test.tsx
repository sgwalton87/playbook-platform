import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Library from "@/components/brand/BrandVerificationDocumentLibrary";
const fetchMock = vi.fn();
const file = { id: "example", type: "Business card", organizationName: "Example Brand", status: "approved", url: "/api/admin/verification/brand-evidence/file?documentId=example", uploadedAt: "2020-01-01T00:00:00Z", archivedAt: null, archiveReason: null };
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("admin retained document folder", () => {
  it("opens closed-review files and archives them with a reason while retaining access", async () => {
    let archived = false;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === "POST") { archived = true; return Response.json({ archived: true, retained: true }); }
      const viewingArchive = url.includes("archived=true");
      return Response.json({ documents: viewingArchive === archived ? [{ ...file, archivedAt: archived ? "2026-10-28T00:00:00Z" : null, archiveReason: archived ? "Review complete" : null }] : [] });
    });
    render(<Library />);
    const link = await screen.findByRole("link", { name: /Open business card/ });
    expect(link.getAttribute("href")).toBe(file.url);
    expect(screen.getByText(/72 hours from submission/)).toBeTruthy();
    const archive = screen.getByRole("button", { name: "Archive document" }) as HTMLButtonElement;
    expect(archive.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Archive reason"), { target: { value: "Review complete" } });
    fireEvent.click(archive);
    await screen.findByText(/No active documents/);
    fireEvent.click(screen.getByRole("button", { name: "Archived documents" }));
    await screen.findByRole("link", { name: /Open business card/ });
    expect(screen.getByText(/Archived .*Review complete/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Delete/i })).toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/admin/verification/brand-evidence/archive", expect.objectContaining({ method: "POST", body: JSON.stringify({ documentId: "example", reason: "Review complete" }) })));
  });
  it("shows permission errors without claiming the folder is empty", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "Admin access required" }, { status: 403 }));
    render(<Library />);
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Admin access required");
    expect(screen.queryByText(/No active documents/)).toBeNull();
  });
});

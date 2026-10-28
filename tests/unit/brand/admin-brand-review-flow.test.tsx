import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), fetch: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }), usePathname: () => "/admin" }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: { auth: { getUser: mocks.getUser } } }));
import AdminPage from "@/app/admin/page";

const row = { request_type: "brand-partner", request_id: "test-request", status: "pending", submitted_at: "2026-10-28T18:25:00Z", evidence: { organization_name: "Example Brand" } };
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "reviewer" } } });
  mocks.fetch.mockImplementation(async (url: string, init?: RequestInit) => {
    if (url.includes("brand-evidence") && !url.includes("requestId=")) return Response.json({ documents: [] });
    if (url.includes("brand-evidence")) return Response.json({ documents: [{ name: "business-card.jpg", type: "Business card", url: "https://private.example/temporary" }] });
    if (init?.method === "PATCH") return Response.json({ review: {} });
    return Response.json({ requests: [row] });
  });
  vi.stubGlobal("fetch", mocks.fetch);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("admin dashboard document review flow", () => {
  it("connects the pending request to private files and requires review plus a reason before approval", async () => {
    render(<AdminPage />);
    await screen.findByText("Example Brand");
    const approve = screen.getByRole("button", { name: "Approve" }) as HTMLButtonElement;
    expect(approve.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Decision reason"), { target: { value: "Business identity matches submitted organization." } });
    expect(approve.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Open submitted evidence" }));
    const link = await screen.findByRole("link", { name: /Business card/ });
    expect(link.getAttribute("href")).toBe("https://private.example/temporary");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(approve.disabled).toBe(false);
    fireEvent.click(approve);
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledWith("/api/admin/verification", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ requestType: "brand-partner", requestId: "test-request", decision: "approved", notes: "Business identity matches submitted organization." }) })));
  });
  it("blocks approval when the request has no uploaded document", async () => {
    mocks.fetch.mockImplementation(async (url: string) => Response.json(url.includes("brand-evidence") ? { documents: [] } : { requests: [row] }));
    render(<AdminPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Open submitted evidence" }));
    await screen.findByText(/No business documents on file/);
    expect((screen.getByRole("button", { name: "Approve" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
  it("shows the permission boundary for a non-reviewer", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ error: "Reviewer authority required" }, { status: 403 }));
    render(<AdminPage />);
    await screen.findByText("Reviewer authority required");
    expect(screen.queryByRole("button", { name: "Open submitted evidence" })).toBeNull();
  });
});

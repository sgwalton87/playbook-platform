// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ requireUser: vi.fn(), rpc: vi.fn(), download: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ requireUser: mocks.requireUser }));
import { GET } from "@/app/api/admin/verification/brand-evidence/route";
import { GET as openFile } from "@/app/api/admin/verification/brand-evidence/file/route";
import { POST as archive } from "@/app/api/admin/verification/brand-evidence/archive/route";
const requestId = "11111111-1111-4111-8111-111111111111";
const documentId = "22222222-2222-4222-8222-222222222222";
const objectPath = `${requestId}/business-card-${documentId}.jpg`;
const request = (query = `requestId=${requestId}`) => new NextRequest(`http://localhost/api/admin/verification/brand-evidence?${query}`);
const fileRequest = () => request(`documentId=${documentId}`);
const archiveRequest = (reason = "Review complete") => new NextRequest("http://localhost/api/admin/verification/brand-evidence/archive", { method: "POST", body: JSON.stringify({ documentId, reason }) });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.from.mockReturnValue({ download: mocks.download });
  mocks.requireUser.mockResolvedValue({ user: { id: "reviewer" }, supabase: { rpc: mocks.rpc, storage: { from: mocks.from } } });
  mocks.rpc.mockResolvedValue({ data: [{ document_id: documentId, storage_path: objectPath, document_type: "Business card", uploaded_at: "2020-01-01T00:00:00Z", request_id: requestId, organization_name: "Example", verification_status: "approved", submitted_at: "2020-01-01T00:00:00Z", archived_at: null, archive_reason: null }], error: null });
  mocks.download.mockResolvedValue({ data: new Blob(["private bytes"]), error: null });
});
describe("retained admin document API", () => {
  it("returns stable authenticated file links and 72-hour review targets even after review closes", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, private");
    const body = await response.json();
    expect(body).toMatchObject({ reviewInbox: "onboarding@playbookseriesinc.org", reviewTargetHours: 72, documents: [{ id: documentId, status: "approved", url: `/api/admin/verification/brand-evidence/file?documentId=${documentId}`, reviewDueAt: "2020-01-04T00:00:00.000Z" }] });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("opens bytes through current-session RLS without a signed URL", async () => {
    mocks.rpc.mockResolvedValue({ data: objectPath, error: null });
    const response = await openFile(fileRequest());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("private bytes");
    expect(mocks.rpc).toHaveBeenCalledWith("open_brand_verification_document", { requested_document_id: documentId });
    expect(mocks.download).toHaveBeenCalledWith(objectPath);
    expect(response.headers.get("cache-control")).toBe("no-store, private");
    expect(response.headers.get("content-type")).toBe("image/jpeg");
  });
  it("denies signed-out access at all entry points", async () => {
    mocks.requireUser.mockResolvedValue({ user: null });
    expect((await GET(request())).status).toBe(401);
    expect((await openFile(fileRequest())).status).toBe(401);
    expect((await archive(archiveRequest())).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("denies non-admin listing, opening and archiving without touching file bytes", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "42501" } });
    expect((await GET(request())).status).toBe(403);
    expect((await openFile(fileRequest())).status).toBe(403);
    expect((await archive(archiveRequest())).status).toBe(403);
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it("rejects malformed IDs, invalid pages and blank archive reasons", async () => {
    expect((await GET(request("requestId=invalid"))).status).toBe(400);
    expect((await GET(request("page=-1"))).status).toBe(400);
    expect((await openFile(request("documentId=invalid"))).status).toBe(400);
    expect((await archive(archiveRequest("  "))).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("loads the archived folder independently of an open verification request", async () => {
    await GET(request("archived=true&page=1"));
    expect(mocks.rpc).toHaveBeenCalledWith("get_brand_verification_documents", { requested_request_id: null, requested_archived: true, requested_offset: 100 });
  });
  it("archives with a reason and does not call Storage deletion", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    const response = await archive(archiveRequest());
    expect(await response.json()).toEqual({ archived: true, retained: true });
    expect(mocks.rpc).toHaveBeenCalledWith("archive_brand_verification_document", { requested_document_id: documentId, requested_reason: "Review complete" });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("fails closed for missing objects and download outages", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "P0002" } });
    expect((await openFile(fileRequest())).status).toBe(404);
    mocks.rpc.mockResolvedValue({ data: objectPath, error: null });
    mocks.download.mockResolvedValue({ data: null, error: { message: "unavailable" } });
    expect((await openFile(fileRequest())).status).toBe(503);
  });
});

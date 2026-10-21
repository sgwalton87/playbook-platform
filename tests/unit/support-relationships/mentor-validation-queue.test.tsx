import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import MentorValidationQueue from "@/components/mentor/MentorValidationQueue";
const { rpc, from, getUser } = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), getUser: vi.fn() }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: { rpc, from, auth: { getUser } } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
beforeEach(() => {
 getUser.mockResolvedValue({ data: { user: { id: "validator" } } });
 from.mockImplementation((table: string) => {
  if (table === "profiles") throw new Error("Cross-user raw profile read prohibited");
  const data = table === "support_relationships" ? [{ id: "relationship", scholar_id: "scholar", relationship: "educator" }]
   : table === "mentor_validation_requests" ? [{ id: "request", scholar_id: "scholar", mentor_user_id: "mentor", mentor_name: "Candidate", mentor_email: "candidate@example.test", status: "pending", created_at: "2026-10-20T00:00:00Z" }] : [];
  const chain = { select: vi.fn(), eq: vi.fn(), in: vi.fn(), order: vi.fn(), then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve) };
  for (const method of [chain.select, chain.eq, chain.in, chain.order]) method.mockReturnValue(chain);
  return chain;
 });
});
it("shows the connected Scholar identity through the governed support projection", async () => {
 rpc.mockResolvedValue({ data: [{ scholar_id: "scholar", display_name: "Connected Scholar" }], error: null });
 render(<MentorValidationQueue />);
 expect(await screen.findByText(/Connected Scholar · Your active role: educator/)).toBeTruthy();
 expect(rpc).toHaveBeenCalledWith("get_available_support_scholar_contexts");
 expect(from).not.toHaveBeenCalledWith("profiles");
 expect(screen.getByRole("button", { name: "Approve Mentor" })).toBeTruthy();
});
it("withholds approvals when the identity projection cannot be verified", async () => {
 rpc.mockResolvedValue({ data: null, error: { message: "Support projection unavailable" } });
 render(<MentorValidationQueue />);
 expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Support projection unavailable");
 expect(screen.queryByRole("button", { name: "Approve Mentor" })).toBeNull();
});
it("shows a recoverable failure instead of leaving rejected loads pending", async () => {
 rpc.mockRejectedValue(new Error("network"));
 render(<MentorValidationQueue />);
 expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Mentor validation could not be loaded. Please refresh to retry.");
 expect(screen.queryByRole("button", { name: "Approve Mentor" })).toBeNull();
});

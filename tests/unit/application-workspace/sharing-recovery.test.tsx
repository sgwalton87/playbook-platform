import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@/components/application-workspace/ApplicationWorkspaceDashboard";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: { rpc } }));
vi.mock("@/components/application-workspace/ApplicationSupportRequestPanel", () => ({ default: () => null }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

function setup() {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ workspaces: [{ id: "owned-workspace", opportunity_id: "listing", opportunity_name: "My scholarship", status: "submitted", delivery_state: "DELIVERED", application_workspace_tasks: [], application_workspace_documents: [] }] }) }));
}

it("keeps workspaces visible during missing-RPC errors and restores controls after retry", async () => {
  setup();
  rpc.mockResolvedValueOnce({ error: { message: "Could not find the function in the schema cache", code: "PGRST202" } })
    .mockResolvedValueOnce({ data: [{ workspace_id: "owned-workspace", consent_status: "active", outcome_status: "submitted" }], error: null });
  render(<Dashboard />);
  await screen.findByText("My scholarship");
  expect(screen.queryByText("Share submitted application with organization")).toBeNull();
  expect(screen.getByText(/existing access may still be active/)).toBeTruthy();
  fireEvent.click(screen.getByText("Retry sharing status"));
  await screen.findByText("Revoke organization access");
  expect(rpc).toHaveBeenCalledTimes(2);
});

it("keeps workspaces visible when the sharing request rejects", async () => {
  setup(); rpc.mockRejectedValue(new Error("network unavailable"));
  render(<Dashboard />);
  await screen.findByText("My scholarship");
  await waitFor(() => expect(screen.getByText(/Sharing controls are unavailable/)).toBeTruthy());
  expect(screen.queryByText("Share submitted application with organization")).toBeNull();
});

import React, { useEffect } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  fetch: vi.fn(),
  saved: null as null | Record<string, unknown>,
  request: {
    id: "req-1", organization_name: "Bulletproof Group LLC", brand_category: "other",
    nil_acknowledgement: "Acknowledged", campaign_types: [],
    campaign_scope_approved: false, compliance_scope_approved: false,
    status: "pending", submitted_at: "2026-11-17T12:00:00Z", review_notes: null,
  },
}));

vi.mock("@/components/trust/CommunityVettingJourney", () => ({
  default: ({ onAccepted }: { onAccepted: () => void }) => {
    useEffect(() => { onAccepted(); }, [onAccepted]);
    return <p>Community standards acknowledged</p>;
  },
}));
vi.mock("@/components/brand/BrandVerificationEvidenceUpload", () => ({
  default: ({ onEvidenceChange }: { onEvidenceChange?: (value: boolean) => void }) => {
    useEffect(() => { onEvidenceChange?.(true); }, [onEvidenceChange]);
    return <p>3 previously uploaded documents remain on file</p>;
  },
}));
vi.mock("@/components/ui", () => ({
  PlaybookButton: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  PlaybookPage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";

beforeEach(() => {
  state.saved = null;
  state.fetch.mockReset();
  state.fetch.mockImplementation(async (url: string, init?: RequestInit) => {
    if (url !== "/api/brand-verification") throw new Error("Unexpected endpoint");
    if (init?.method === "POST") throw new Error("Registration save must not resubmit verification");
    if (init?.method === "PATCH") {
      const payload = JSON.parse(String(init.body)) as { registration: Record<string, unknown> };
      state.saved = {
        formation_state: payload.registration.formationState,
        entity_type: payload.registration.entityType,
        entity_number: payload.registration.entityNumber,
        safety_answers: payload.registration.safetyAnswers,
        safeguarding_accepted: payload.registration.safeguardingAccepted,
      };
      return Response.json({ ok: true, savedAt: "2026-11-17T14:00:00Z", message: "Business registration details saved. Your verification is still awaiting independent review." });
    }
    return Response.json({
      ok: true, onboardingCompleted: true, request: state.request,
      registrationDetails: state.saved, workflow: null,
    });
  });
  vi.stubGlobal("fetch", state.fetch);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Brand Partner return-login registration persistence", () => {
  it("distinguishes stored documents and pending request from missing saved registration", async () => {
    render(<BrandPartnerVerificationGate><p>Brand Partner workspace</p></BrandPartnerVerificationGate>);
    expect(await screen.findByText(/Your verification request is saved and pending, but your business registration/)).toBeTruthy();
    expect(screen.getByText("3 previously uploaded documents remain on file")).toBeTruthy();
    expect((screen.getByLabelText("Formation state or jurisdiction") as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText("Business structure") as HTMLSelectElement).value).toBe("");
  });

  it("saves registration without resubmitting, then restores it after returning to the page", async () => {
    const page = render(<BrandPartnerVerificationGate><p>Brand Partner workspace</p></BrandPartnerVerificationGate>);
    await screen.findByText(/Your verification request is saved and pending, but your business registration/);
    fireEvent.change(screen.getByLabelText("Formation state or jurisdiction"), { target: { value: "California" } });
    fireEvent.change(screen.getByLabelText("Business structure"), { target: { value: "LLC" } });
    for (const label of [
      /legally reportable conviction involving abuse/,
      /legally reportable conviction involving theft/,
      /legally reportable conviction involving assault/,
      /currently pending criminal charges/,
      /current court or regulatory restriction/,
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value: "no" } });
    }
    fireEvent.click(screen.getByLabelText(/I will follow Playbook student-protection/));
    fireEvent.click(screen.getByRole("button", { name: "Save registration details" }));
    await screen.findByText(/Business registration details saved/);
    expect(state.fetch).toHaveBeenCalledWith("/api/brand-verification", expect.objectContaining({ method: "PATCH" }));
    expect(state.fetch.mock.calls.some(([,init]) => init?.method === "POST")).toBe(false);
    expect(state.request.status).toBe("pending");
    page.unmount();

    render(<BrandPartnerVerificationGate><p>Brand Partner workspace</p></BrandPartnerVerificationGate>);
    await waitFor(() => expect((screen.getByLabelText("Formation state or jurisdiction") as HTMLSelectElement).value).toBe("California"));
    expect((screen.getByLabelText("Business structure") as HTMLSelectElement).value).toBe("LLC");
    expect(screen.queryByText(/Your verification request is saved and pending, but your business registration/)).toBeNull();
    expect(screen.getByText("3 previously uploaded documents remain on file")).toBeTruthy();
    expect(screen.getByText(/Brand Partner verification pending/)).toBeTruthy();
  });
});

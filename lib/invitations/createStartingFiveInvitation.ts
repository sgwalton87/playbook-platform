import { supabase } from "@/lib/supabaseClient";

type InvitationResponse = {
  success: boolean;
  invitationId: string;
  expiresAt: string;
};

export async function createStartingFiveInvitation(
  memberId: string,
): Promise<InvitationResponse> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("You must be signed in to send an invitation.");
  }

  const response = await fetch("/api/invitations/starting-five", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ memberId }),
  });

  const result = (await response.json()) as
    | InvitationResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in result && result.error
        ? result.error
        : "Unable to send invitation.",
    );
  }

  return result as InvitationResponse;
}

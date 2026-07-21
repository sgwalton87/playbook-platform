import { supabase } from "@/lib/supabaseClient";

export async function cancelStartingFiveInvitation(
  memberId: string,
) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("You must be signed in.");
  }

  const response = await fetch("/api/invitations/starting-five", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      memberId,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ?? "Unable to cancel invitation."
    );
  }

  return result;
}

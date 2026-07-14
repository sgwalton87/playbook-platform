import { supabase } from "@/lib/supabaseClient";

export type ConnectionStatus =
  | "self"
  | "connected"
  | "pending_sent"
  | "pending_received"
  | "none";

export async function getConnectionStatus(currentUserId: string, targetUserId: string): Promise<ConnectionStatus> {
  if (currentUserId === targetUserId) return "self";

  const { data: existingConnection } = await supabase
    .from("user_connections")
    .select("id")
    .eq("user_id", currentUserId)
    .eq("connected_user_id", targetUserId)
    .maybeSingle();

  if (existingConnection) return "connected";

  const { data: sent } = await supabase
    .from("connection_requests")
    .select("id,status")
    .eq("requester_id", currentUserId)
    .eq("recipient_id", targetUserId)
    .eq("status", "pending")
    .maybeSingle();

  if (sent) return "pending_sent";

  const { data: received } = await supabase
    .from("connection_requests")
    .select("id,status")
    .eq("requester_id", targetUserId)
    .eq("recipient_id", currentUserId)
    .eq("status", "pending")
    .maybeSingle();

  if (received) return "pending_received";

  return "none";
}

export async function sendConnectionRequest(currentUserId: string, targetUserId: string, message?: string) {
  return supabase.from("connection_requests").upsert(
    {
      requester_id: currentUserId,
      recipient_id: targetUserId,
      status: "pending",
      message: message || null,
    },
    { onConflict: "requester_id,recipient_id" }
  );
}

export async function acceptConnectionRequest(currentUserId: string, targetUserId: string) {
  const { data: request, error } = await supabase
    .from("connection_requests")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    })
    .eq("requester_id", targetUserId)
    .eq("recipient_id", currentUserId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) return { error };
  if (!request) return { error: new Error("No pending request found.") };

  const a = await supabase.from("user_connections").upsert(
    {
      user_id: currentUserId,
      connected_user_id: targetUserId,
    },
    { onConflict: "user_id,connected_user_id" }
  );

  if (a.error) return { error: a.error };

  const b = await supabase.from("user_connections").upsert(
    {
      user_id: targetUserId,
      connected_user_id: currentUserId,
    },
    { onConflict: "user_id,connected_user_id" }
  );

  return b;
}

export async function declineConnectionRequest(currentUserId: string, targetUserId: string) {
  return supabase
    .from("connection_requests")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("requester_id", targetUserId)
    .eq("recipient_id", currentUserId)
    .eq("status", "pending");
}

export async function removeConnection(currentUserId: string, targetUserId: string) {
  const a = await supabase
    .from("user_connections")
    .delete()
    .eq("user_id", currentUserId)
    .eq("connected_user_id", targetUserId);

  if (a.error) return a;

  return supabase
    .from("user_connections")
    .delete()
    .eq("user_id", targetUserId)
    .eq("connected_user_id", currentUserId);
}

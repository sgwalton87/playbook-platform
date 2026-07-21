import { supabase } from "@/lib/supabaseClient";
import { SupportNetworkMember } from "./types";

type Row = {
  id: string;
  scholar_id: string;
  role: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  status: string;
  is_starting_five: boolean;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): SupportNetworkMember {
  return {
    id: row.id,
    scholarId: row.scholar_id,
    role: row.role as SupportNetworkMember["role"],
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    relationship: row.relationship,
    status: row.status as SupportNetworkMember["status"],
    isStartingFive: row.is_starting_five,
    invitedAt: row.invited_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSupportNetwork(
  scholarId: string
): Promise<SupportNetworkMember[]> {
  const { data, error } = await supabase
    .from("support_network_members")
    .select("*")
    .eq("scholar_id", scholarId)
    .order("created_at");

  if (error) throw error;

  return (data ?? []).map(mapRow);
}

export async function addSupportMember(input: {
  scholarId: string;
  role: string;
  fullName: string;
  email?: string;
  phone?: string;
  relationship?: string;
  isStartingFive?: boolean;
}) {
  const { data, error } = await supabase
    .from("support_network_members")
    .insert({
      scholar_id: input.scholarId,
      role: input.role,
      full_name: input.fullName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      relationship: input.relationship ?? null,
      is_starting_five: input.isStartingFive ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return mapRow(data as Row);
}

export async function updateSupportMember(
  id: string,
  updates: Partial<{
    fullName: string;
    email: string;
    phone: string;
    relationship: string;
    status: string;
  }>
) {
  const payload: Record<string, unknown> = {};

  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.relationship !== undefined)
    payload.relationship = updates.relationship;
  if (updates.status !== undefined) payload.status = updates.status;

  const { data, error } = await supabase
    .from("support_network_members")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapRow(data as Row);
}

export async function deleteSupportMember(id: string) {
  const { error } = await supabase
    .from("support_network_members")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
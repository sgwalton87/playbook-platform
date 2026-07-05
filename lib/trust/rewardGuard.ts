export type RewardGuardInput = {
  eventType: string;
  sourceId: string;
  scholarId: string;
};

export async function hasExistingReward(
  supabase: any,
  input: RewardGuardInput
) {
  const { data } = await supabase
    .from("coin_ledger")
    .select("id")
    .eq("scholar_id", input.scholarId)
    .eq("event_type", input.eventType)
    .eq("source_id", input.sourceId)
    .limit(1);

  return Boolean(data?.length);
}


export async function countRecentRewards(
  supabase: any,
  input: {
    scholarId: string;
    eventType: string;
    since: string;
  }
) {
  const { count } = await supabase
    .from("coin_ledger")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("scholar_id", input.scholarId)
    .eq("event_type", input.eventType)
    .gte("created_at", input.since);

  return count || 0;
}

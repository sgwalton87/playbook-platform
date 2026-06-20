import { supabase } from "@/lib/supabaseClient";

export const addReward = async (
  userId: string,
  {
    xp = 0,
    coins = 0,
  }: {
    xp?: number;
    coins?: number;
  }
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("xp, coin_balance")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const newXP = (data?.xp || 0) + xp;
  const newCoins = (data?.coin_balance || 0) + coins;

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({
      xp: newXP,
      coin_balance: newCoins,
    })
    .eq("id", userId)
    .select()
    .single();

  if (updateError) throw updateError;

  return updated;
};
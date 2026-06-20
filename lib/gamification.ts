import { supabase } from "@/lib/supabaseClient";

export const addReward = async (
  userId: string,
  payload: { xp?: number; coins?: number }
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("xp, coin_balance, level")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const newXP = (data?.xp || 0) + (payload.xp || 0);
  const newCoins = (data?.coin_balance || 0) + (payload.coins || 0);
  const newLevel = Math.floor(newXP / 100) + 1;

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({
      xp: newXP,
      coin_balance: newCoins,
      level: newLevel,
    })
    .eq("id", userId)
    .select()
    .single();

  if (updateError) throw updateError;

  return updated;
};
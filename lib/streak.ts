import { supabase } from "@/lib/supabaseClient";

export const updateStreak = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("profiles")
    .select("last_login, streak")
    .eq("id", userId)
    .single();

  let streak = data?.streak || 0;

  if (data?.last_login !== today) {
    streak += 1;

    await supabase
      .from("profiles")
      .update({
        streak,
        last_login: today,
      })
      .eq("id", userId);
  }

  return streak;
};
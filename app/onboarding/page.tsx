"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");

  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const save = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const updates: any = {
      first_name: firstName,
      last_name: lastName,
      gender,
    };

    if (school) updates.school = school;
    if (sport) updates.sport = sport;
    if (location) updates.location = location;

    await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    // 💰 reward onboarding completion
    await supabase.rpc("add_coins", {
      user_id: user.id,
      amount: 50,
    });

    router.replace("/dashboard");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h1>Complete Your Profile</h1>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <input placeholder="First Name" value={firstName}
            onChange={(e) => setFirstName(e.target.value)} />

          <input placeholder="Last Name" value={lastName}
            onChange={(e) => setLastName(e.target.value)} />

          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="transgender">Transgender</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>

          <button onClick={nextStep}>Next</button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <input placeholder="School" value={school}
            onChange={(e) => setSchool(e.target.value)} />

          <input placeholder="Sport" value={sport}
            onChange={(e) => setSport(e.target.value)} />

          <input placeholder="City" value={location}
            onChange={(e) => setLocation(e.target.value)} />

          <button onClick={prevStep}>Back</button>
          <button onClick={save}>Finish</button>
        </>
      )}
    </div>
  );
}
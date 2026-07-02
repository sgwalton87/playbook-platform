export function buildIdentity(profile:any){
  return {
    id: profile?.id,
    username: profile?.username,
    role: profile?.role,

    firstName: profile?.first_name,
    lastName: profile?.last_name,

    fullName:
      profile?.full_name ||
      [profile?.first_name,profile?.last_name]
        .filter(Boolean)
        .join(" "),

    avatarUrl: profile?.avatar_url,

    school: profile?.school,

    grade: profile?.grade,

    graduationYear:
      profile?.graduation_year ||
      profile?.grad_year,
  };
}

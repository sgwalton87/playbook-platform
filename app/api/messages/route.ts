import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizePlaybookRole } from "@/lib/roles/registry";

const LEARNER_ROLES = new Set([
  "scholar",
  "scholar-athlete",
  "transition-youth",
  "athlete-abroad",
]);

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const accessToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { data: { user } } = await supabase.auth.getUser(accessToken);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: relationships, error: relationshipError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id,full_name,username,role,profile_mode")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("support_relationships")
        .select("scholar_id,supporter_id,supporter_email,supporter_name,relationship,status")
        .eq("status", "active"),
    ]);

  if (relationshipError) {
    return NextResponse.json({ error: relationshipError.message }, { status: 400 });
  }

  const accessible = (relationships || []).filter((relationship) =>
    relationship.scholar_id === user.id ||
    relationship.supporter_id === user.id ||
    (
      user.email &&
      relationship.supporter_email?.toLowerCase() === user.email.toLowerCase()
    ),
  );
  const role = normalizePlaybookRole(profile?.profile_mode || profile?.role);
  const scholarIds = new Set(accessible.map((relationship) => relationship.scholar_id));

  if (LEARNER_ROLES.has(role)) scholarIds.add(user.id);

  if (scholarIds.size === 0) {
    return NextResponse.json({
      currentUser: {
        id: user.id,
        name: profile?.full_name || profile?.username || user.email || "Playbook member",
        role,
      },
      networks: [],
    });
  }

  const { data: messages, error: messageError } = await supabase
    .from("support_messages")
    .select("id,scholar_id,sender_id,sender_role,body,created_at")
    .in("scholar_id", [...scholarIds])
    .order("created_at", { ascending: false });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 400 });
  }

  const profileIds = new Set<string>([...scholarIds, user.id]);
  for (const message of messages || []) {
    if (message.sender_id) profileIds.add(message.sender_id);
  }
  for (const relationship of accessible) {
    if (relationship.supporter_id) profileIds.add(relationship.supporter_id);
  }

  const { data: people } = await supabase
    .from("profiles")
    .select("id,full_name,username,role,profile_mode")
    .in("id", [...profileIds]);
  const personById = new Map((people || []).map((person) => [person.id, person]));

  const networks = [...scholarIds].map((scholarId) => {
    const scholar = personById.get(scholarId);
    const scholarName =
      scholar?.full_name || scholar?.username ||
      (scholarId === user.id ? profile?.full_name || profile?.username : null) ||
      "Your scholar";
    const networkRelationships = accessible.filter(
      (relationship) => relationship.scholar_id === scholarId,
    );
    const participants = [
      scholarName,
      ...networkRelationships.map((relationship) => {
        const supporter = relationship.supporter_id
          ? personById.get(relationship.supporter_id)
          : null;
        return (
          supporter?.full_name ||
          supporter?.username ||
          relationship.supporter_name ||
          relationship.relationship.replaceAll("_", " ")
        );
      }),
    ];
    const threadMessages = (messages || [])
      .filter((message) => message.scholar_id === scholarId)
      .map((message) => {
        const sender = message.sender_id ? personById.get(message.sender_id) : null;
        return {
          ...message,
          sender_name:
            sender?.full_name ||
            sender?.username ||
            (message.sender_id === user.id
              ? profile?.full_name || profile?.username
              : null) ||
            message.sender_role.replaceAll("_", " "),
        };
      });

    return {
      id: scholarId,
      scholarId,
      title: `${scholarName}’s Support Network`,
      participants: [...new Set(participants)],
      unreadCount: 0,
      lastMessage: threadMessages[0]?.body || "No messages yet.",
      messages: threadMessages,
    };
  });

  return NextResponse.json({
    currentUser: {
      id: user.id,
      name: profile?.full_name || profile?.username || user.email || "Playbook member",
      role,
    },
    networks,
  });
}

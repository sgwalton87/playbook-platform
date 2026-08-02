import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.SUPABASE_TEST_URL;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);

describe.skipIf(!enabled)("authenticated Supabase authorization and RLS", () => {
  let admin!: SupabaseClient;
  let scholarClient!: SupabaseClient;
  let supporterClient!: SupabaseClient;
  let unrelatedClient!: SupabaseClient;
  const password = `Pbos!${randomUUID()}`;
  const suffix = randomUUID();
  const users = [
    { email: `scholar-${suffix}@example.com`, role: "scholar" },
    { email: `supporter-${suffix}@example.com`, role: "mentor" },
    { email: `unrelated-${suffix}@example.com`, role: "scholar" },
  ];
  const ids: string[] = [];
  let evidenceId = "";
  let storeProductId = "";

  beforeAll(async () => {
    admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    scholarClient = createClient(url!, anonKey!, { auth: { persistSession: false } });
    supporterClient = createClient(url!, anonKey!, { auth: { persistSession: false } });
    unrelatedClient = createClient(url!, anonKey!, { auth: { persistSession: false } });
    const clients = [scholarClient, supporterClient, unrelatedClient];
    for (const [index, candidate] of users.entries()) {
      const { data, error } = await admin.auth.admin.createUser({ email: candidate.email, password, email_confirm: true });
      if (error || !data.user) throw error || new Error("Test user creation failed");
      ids.push(data.user.id);
      const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, email: candidate.email, full_name: candidate.role === "scholar" ? "Test Scholar" : "Test Supporter", role: candidate.role, profile_mode: candidate.role });
      if (profileError) throw profileError;
      const { error: signInError } = await clients[index].auth.signInWithPassword({ email: candidate.email, password });
      if (signInError) throw signInError;
    }
    const [scholarId, supporterId] = ids;
    const { data: record, error: recordError } = await scholarClient.from("playbook_records").insert({ profile_id: scholarId, created_by: scholarId, updated_by: scholarId }).select("id").single();
    if (recordError) throw recordError;
    const { data: achievement, error: achievementError } = await scholarClient.from("achievements").insert({ record_id: record.id, title: "RLS Evidence", created_by: scholarId, updated_by: scholarId }).select("id").single();
    if (achievementError) throw achievementError;
    const { data: evidence, error: evidenceError } = await scholarClient.from("evidence").insert({ achievement_id: achievement.id, owner_id: scholarId, title: "Private Evidence", evidence_type: "document", source_type: "institution", verification_state: "pending", visibility: "private", consent_scope: "owner_only", created_by: scholarId, updated_by: scholarId }).select("id").single();
    if (evidenceError) throw evidenceError;
    evidenceId = evidence.id;
    const { error: relationshipError } = await scholarClient.from("support_relationships").insert({ scholar_id: scholarId, supporter_id: supporterId, supporter_email: users[1].email, supporter_name: "Test Supporter", relationship: "mentor", permissions: ["view_progress", "view_evidence", "verify_evidence"], status: "active" });
    if (relationshipError) throw relationshipError;
    const { data: product, error: productError } = await admin.from("store_products").insert({ product_key: `integration-${suffix}`, name: "Integration reward", category: "test", coin_price: 20, inventory: 1, active: true }).select("id").single();
    if (productError) throw productError;
    storeProductId = product.id;
    const { error: ledgerError } = await admin.from("coin_ledger").insert({ scholar_id: scholarId, event_type: "integration.seed", source_id: suffix, coins: 25, xp: 0, reason: "Integration test balance" });
    if (ledgerError) throw ledgerError;
  });

  afterAll(async () => {
    if (!enabled) return;
    await admin.from("notifications").delete().in("user_id", ids);
    await admin.from("active_scholar_contexts").delete().in("user_id", ids);
    await admin.from("support_relationships").delete().in("scholar_id", ids);
    await admin.from("support_invitations").delete().in("scholar_id", ids);
    await admin.from("store_redemptions").delete().in("scholar_id", ids);
    await admin.from("coin_ledger").delete().in("scholar_id", ids);
    if (storeProductId) await admin.from("store_products").delete().eq("id", storeProductId);
    for (const id of ids) await admin.auth.admin.deleteUser(id);
  });

  it("denies unrelated and owner-only supporter reads, then permits explicit consent", async () => {
    expect((await unrelatedClient.from("evidence").select("id").eq("id", evidenceId)).data).toHaveLength(0);
    expect((await supporterClient.from("evidence").select("id").eq("id", evidenceId)).data).toHaveLength(0);
    const { error } = await scholarClient.from("evidence").update({ consent_scope: "relationship" }).eq("id", evidenceId);
    expect(error).toBeNull();
    expect((await supporterClient.from("evidence").select("id").eq("id", evidenceId)).data).toHaveLength(1);
  });

  it("persists an explicit active Scholar context only for an active relationship", async () => {
    const [scholarId, supporterId, unrelatedId] = ids;
    const { data: relationship } = await supporterClient.from("support_relationships").select("id").eq("scholar_id", scholarId).single();
    expect(relationship).not.toBeNull();
    const relationshipId = relationship!.id;
    expect((await supporterClient.from("active_scholar_contexts").insert({ user_id: supporterId, scholar_id: scholarId, relationship_id: relationshipId })).error).toBeNull();
    expect((await unrelatedClient.from("active_scholar_contexts").insert({ user_id: unrelatedId, scholar_id: scholarId, relationship_id: relationshipId })).error).not.toBeNull();
  });

  it("accepts an invitation and creates its relationship atomically and idempotently", async () => {
    const [scholarId] = ids;
    const invitationId = randomUUID();
    const token = randomUUID();
    const { error } = await scholarClient.from("support_invitations").insert({ id: invitationId, scholar_id: scholarId, scholar_name: "Test Scholar", invitee_name: "Test Supporter", invitee_email: users[1].email, relationship: "mentor", token, permissions: ["view_evidence", "verify_evidence"], destination: "/mentor-os" });
    expect(error).toBeNull();
    expect((await supporterClient.rpc("accept_support_invitation", { p_token: token, p_status: "accepted" })).error).toBeNull();
    expect((await supporterClient.rpc("accept_support_invitation", { p_token: token, p_status: "accepted" })).error).toBeNull();
    const { data: rows } = await admin.from("support_relationships").select("id").eq("source_invitation_id", invitationId);
    expect(rows).toHaveLength(1);
  });

  it("denies direct reward emission to a non-administrator", async () => {
    const [scholarId] = ids;
    const { error } = await scholarClient.rpc("emit_reward_event", { p_event: { scholar_id: scholarId, event_type: "integration.test", source_id: suffix, payload: {} }, p_ledger: { scholar_id: scholarId, event_type: "integration.test", source_id: suffix, coins: 999, xp: 999, reason: "unauthorized" } });
    expect(error).not.toBeNull();
  });

  it("prices and debits a store redemption atomically on the server", async () => {
    const { data, error } = await scholarClient.rpc("redeem_store_reward", { p_product_id: storeProductId, p_shipping_payload: {} });
    expect(error).toBeNull();
    expect(data).toMatchObject({ coinsSpent: 20, remainingBalance: 5 });
    expect((await scholarClient.rpc("redeem_store_reward", { p_product_id: storeProductId, p_shipping_payload: {} })).error).not.toBeNull();
  });

  it("prevents an unrelated Scholar from reading another Scholar reward balance", async () => {
    const [scholarId] = ids;
    expect((await unrelatedClient.from("coin_ledger").select("id").eq("scholar_id", scholarId)).data).toHaveLength(0);
  });
});

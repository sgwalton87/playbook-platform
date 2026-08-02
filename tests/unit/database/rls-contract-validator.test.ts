import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateRlsContract } from "@/lib/release/rlsContract";

describe("RLS structural contract", () => {
  it("requires every created public table to enable RLS and declare a policy", () => {
    const directory = join(process.cwd(), "supabase", "migrations");
    const sql = readdirSync(directory)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .map((file) => readFileSync(join(directory, file), "utf8"))
      .join("\n");

    expect(evaluateRlsContract(sql)).toEqual([]);
  });

  it("reports missing RLS and missing policy dispositions", () => {
    const sql = `
      create table public.without_rls (id uuid);
      create table public.without_policy (id uuid);
      alter table public.without_policy enable row level security;
    `;

    expect(evaluateRlsContract(sql)).toEqual([
      { table: "without_policy", issue: "policy_missing" },
      { table: "without_rls", issue: "rls_not_enabled" },
    ]);
  });
});

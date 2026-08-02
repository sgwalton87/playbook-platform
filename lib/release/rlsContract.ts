export type RlsContractFinding = {
  table: string;
  issue: "rls_not_enabled" | "policy_missing";
};

function captureTables(sql: string, expression: RegExp): Set<string> {
  return new Set(
    Array.from(sql.matchAll(expression), (match) => match[1].toLowerCase()),
  );
}

export function evaluateRlsContract(sql: string): RlsContractFinding[] {
  const createdTables = captureTables(
    sql,
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z_][a-z0-9_]*)/gi,
  );
  const rlsTables = captureTables(
    sql,
    /alter\s+table\s+(?:if\s+exists\s+)?public\.([a-z_][a-z0-9_]*)\s+enable\s+row\s+level\s+security/gi,
  );
  const policyTables = captureTables(
    sql,
    /create\s+policy\s+(?:"[^"]+"|[^\s]+)\s+on\s+public\.([a-z_][a-z0-9_]*)/gi,
  );
  const findings: RlsContractFinding[] = [];

  for (const table of [...createdTables].sort()) {
    if (!rlsTables.has(table)) {
      findings.push({ table, issue: "rls_not_enabled" });
    } else if (!policyTables.has(table)) {
      findings.push({ table, issue: "policy_missing" });
    }
  }

  return findings;
}

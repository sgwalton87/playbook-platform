#!/usr/bin/env tsx
import fs from "node:fs";
import { renderAuditControlReport, runAuditControl } from "../../pbos/audit-control/run";

const report = runAuditControl();
const rendered = renderAuditControlReport(report);

fs.mkdirSync("docs/GOVERNANCE/AUDITS", { recursive: true });
fs.writeFileSync("docs/GOVERNANCE/AUDITS/PBOS_AUDIT_CONTROL_REPORT.md", rendered);

console.log(rendered);
if (!report.ok) process.exit(1);

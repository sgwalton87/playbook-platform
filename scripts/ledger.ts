import { writeLedgerEvent, type LedgerType } from "../lib/ledger";

const [, , typeArg, ...messageParts] = process.argv;

if (!typeArg || messageParts.length === 0) {
  console.error('Usage: npm run ledger -- <type> "message"');
  process.exit(1);
}

const validTypes = [
  "sprint",
  "release",
  "milestone",
  "architecture",
  "innovation",
  "decision",
  "product",
  "engineering",
  "demo",
];

if (!validTypes.includes(typeArg)) {
  console.error(`Invalid ledger type: ${typeArg}`);
  console.error(`Valid types: ${validTypes.join(", ")}`);
  process.exit(1);
}

const message = messageParts.join(" ");
const result = writeLedgerEvent(typeArg as LedgerType, message);

console.log(`✅ Unified ledger updated: ${result.type} — ${result.message}`);
console.log(`Updated files:`);
result.targets.forEach(target => console.log(`- ${target}`));

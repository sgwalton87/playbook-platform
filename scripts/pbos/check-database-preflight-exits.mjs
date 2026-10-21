import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2] || 'supabase/tests';
const failures = [];
for (const file of readdirSync(directory).filter(name => name.endsWith('.sql'))) {
  const lines = readFileSync(join(directory, file), 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (!line.trimStart().startsWith('--') && /\\(?:quit|q)(?=\s|$)/.test(line)) failures.push(`${file}:${index + 1}`);
  });
}
if (failures.length) {
  console.error('Database preflights must raise SQL errors with ON_ERROR_STOP; psql quit arguments do not certify failure:', failures.join(', '));
  process.exitCode = 1;
} else console.log('Database assertion exit paths checked.');

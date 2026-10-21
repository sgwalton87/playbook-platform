import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const pluginRoot = dirname(require.resolve('@next/eslint-plugin-next/package.json'));
const plugin = JSON.parse(readFileSync(join(pluginRoot, 'package.json'), 'utf8'));
if (plugin.version !== '16.4.2') throw new Error('Review ESLint glob compatibility before upgrading Next');
const file = join(pluginRoot, 'dist/utils/get-root-dirs.js');
const source = readFileSync(file, 'utf8');
const originalHash = '886677432990a735e5ebdfb345ff1cbd40e264f9947a8432eeeb254b3a926bde';
const originalOption = 'onlyDirectories: true';
const patchedOption = 'onlyDirectories: true,\n        expandDirectories: false';
const original = source.replace(patchedOption, originalOption);
if (createHash('sha256').update(original).digest('hex') !== originalHash) {
  throw new Error('Unrecognized Next ESLint root discovery source; compatibility patch refused');
}
const replacement = require(createRequire(join(pluginRoot, 'package.json')).resolve('fast-glob/package.json'));
if (replacement.name !== 'tinyglobby' || replacement.version !== '0.2.17') {
  throw new Error('Expected pinned tinyglobby replacement for Next ESLint directory discovery');
}
if (source === original) writeFileSync(file, original.replace(originalOption, patchedOption));
console.log('Verified Next ESLint directory discovery compatibility (all lint rules retained).');

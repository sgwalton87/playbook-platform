// @vitest-environment node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { Linter } from 'eslint';
import { expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const pluginRoot = dirname(require.resolve('@next/eslint-plugin-next/package.json'));
const { getRootDirs } = require(join(pluginRoot, 'dist/utils/get-root-dirs.js'));
const plugin = require('@next/eslint-plugin-next');

it('discovers only configured Next roots for literal, wildcard, brace and array settings', () => {
  const root = mkdtempSync(join(tmpdir(), 'playbook-next-roots-'));
  try {
    for (const path of ['apps/web/pages/nested','apps/admin/pages','packages/ui']) mkdirSync(join(root,path),{recursive:true});
    const roots = (rootDir: string | string[]) => getRootDirs({cwd:root,settings:{next:{rootDir}}}).map((path: string) => resolve(path)).sort();
    expect(getRootDirs({cwd:root,settings:{}})).toEqual([root]);
    expect(roots(join(root,'apps/web'))).toEqual([join(root,'apps/web')]);
    expect(roots(join(root,'apps/*'))).toEqual([join(root,'apps/admin'),join(root,'apps/web')]);
    expect(roots(join(root,'apps/{admin,web}'))).toEqual([join(root,'apps/admin'),join(root,'apps/web')]);
    expect(roots([join(root,'apps/web'),join(root,'packages/*')])).toEqual([join(root,'apps/web'),join(root,'packages/ui')]);
    expect(roots(join(root,'missing/*'))).toEqual([]);
  } finally { rmSync(root,{recursive:true,force:true}); }
});

it('retains Next internal-link and image lint enforcement with the replacement installed', () => {
  const root = mkdtempSync(join(tmpdir(), 'playbook-next-rules-'));
  try {
    mkdirSync(join(root,'pages'),{recursive:true});
    writeFileSync(join(root,'pages/about.js'),'export default function About() {}');
    const linter = new Linter();
    const messages = linter.verify('const view = <><a href="/about">About</a><img src="/photo.png" alt="Photo" /></>;', [{
      languageOptions:{ecmaVersion:2022,sourceType:'module',parserOptions:{ecmaFeatures:{jsx:true}}},
      plugins:{'@next/next':plugin},settings:{next:{rootDir:root}},
      rules:{'@next/next/no-html-link-for-pages':'error','@next/next/no-img-element':'error'},
    }]);
    expect(messages.map(message=>message.ruleId).sort()).toEqual(['@next/next/no-html-link-for-pages','@next/next/no-img-element']);
  } finally { rmSync(root,{recursive:true,force:true}); }
});

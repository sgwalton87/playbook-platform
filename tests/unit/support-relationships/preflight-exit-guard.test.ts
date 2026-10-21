// @vitest-environment node
import { mkdtempSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect,it } from 'vitest';
const script=resolve('scripts/pbos/check-database-preflight-exits.mjs');
it.each(['\\quit 1','\\if false \\else \\echo failed \\quit 1 \\endif','\\q'])('rejects a preflight that can exit without proving its assertion: %s',source=>{
 const dir=mkdtempSync(join(tmpdir(),'playbook-preflight-exit-'));
 try{writeFileSync(join(dir,'unsafe.sql'),source);const result=spawnSync(process.execPath,[script,dir],{encoding:'utf8'});expect(result.status).toBe(1);expect(result.stderr).toContain('unsafe.sql:1');}finally{rmSync(dir,{recursive:true,force:true});}
});
it('accepts SQL-error assertion paths while allowing explanatory comments',()=>{
 const dir=mkdtempSync(join(tmpdir(),'playbook-preflight-exit-'));
 try{writeFileSync(join(dir,'safe.sql'),"-- Never use \\quit 1\nDO $$ BEGIN RAISE EXCEPTION 'failed'; END $$;\n");expect(spawnSync(process.execPath,[script,dir]).status).toBe(0);}finally{rmSync(dir,{recursive:true,force:true});}
});

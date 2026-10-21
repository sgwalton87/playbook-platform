import { beforeEach, expect, it, vi } from 'vitest';
import { createAchievementWithEvidence } from '@/lib/playbook-record/services/achievements';
const { from,emitEvent }=vi.hoisted(()=>({from:vi.fn(),emitEvent:vi.fn()}));
vi.mock('@/lib/supabaseClient',()=>({supabase:{from}}));
vi.mock('@/lib/events',()=>({emitEvent,registerPlaybookEventHandlers:vi.fn()}));
beforeEach(()=>vi.resetAllMocks());
const input={profileId:'scholar',title:'Achievement',category:'service',evidenceUrl:'https://example.org/evidence',reflection:'What I learned'};
function setup(failure:string) {
 from.mockImplementation((table:string)=>{
  const result={data:table==='playbook_records'?{id:'record'}:{id:'achievement'},error:table===failure?new Error('write denied'):null};
  const q={select:()=>q,eq:()=>q,maybeSingle:async()=>result,single:async()=>result,insert:()=>Object.assign(Promise.resolve(result),q)};return q;
 });
}
it.each(['playbook_records','achievements','evidence_packs','evidence','reflections','timeline_events'])('does not publish achievement success after %s fails',async table=>{
 setup(table);await expect(createAchievementWithEvidence(input)).rejects.toThrow('write denied');expect(emitEvent).not.toHaveBeenCalled();
 if(table==='playbook_records')expect(from).toHaveBeenCalledTimes(1);
});
it('publishes only after the complete write sequence succeeds',async()=>{
 setup('none');await createAchievementWithEvidence(input);expect(emitEvent).toHaveBeenCalledTimes(1);
 expect(from.mock.calls.map(c=>c[0])).toEqual(['playbook_records','achievements','evidence_packs','evidence','reflections','timeline_events']);
});

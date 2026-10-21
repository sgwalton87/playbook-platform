import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { clearEventHandlers, publishEvent } from '@/lib/events/bus';
import { registerTrustHandlers } from '@/lib/events/handlers/trust';
import { registerTimelineHandlers } from '@/lib/events/handlers/timeline';
import { registerPortfolioHandlers } from '@/lib/events/handlers/portfolio';
import { registerOpportunityHandlers } from '@/lib/events/handlers/opportunities';
import { registerCompassHandlers } from '@/lib/events/handlers/compass';
const { from, writes } = vi.hoisted(() => ({ from: vi.fn(), writes: vi.fn() }));
vi.mock('@/lib/supabaseClient', () => ({ supabase: { from } }));
beforeEach(() => {
 vi.resetAllMocks(); clearEventHandlers();
 registerTrustHandlers(); registerTimelineHandlers(); registerPortfolioHandlers(); registerOpportunityHandlers(); registerCompassHandlers();
});
afterEach(clearEventHandlers);
const event = { id: 'event', type: 'AchievementCreated' as const, createdAt: '2026-10-20', payload: { recordId: 'record', profileId: 'scholar', achievementId: 'achievement', title: 'Award', category: 'academic' } };
function setup(failure: string) {
 from.mockImplementation((table: string) => {
  const read = { select: () => read, eq: () => read, is: async () => ({ data: null, error: failure === 'read' ? { message: 'read denied', code: '42501' } : null }) };
  return { ...read, insert: async (row: { source?: string; title?: string }) => {
   writes(table, row);
   const kind = table === 'trust_reports' ? 'trust' : row.source === 'portfolio_engine' ? 'portfolio' : table === 'timeline_events' ? 'timeline' : row.title === 'Compass guidance' ? 'compass' : 'opportunity';
   return { data: null, error: kind === failure ? { message: `${kind} write denied`, code: '42501' } : null };
  } };
 });
}
it('does not manufacture a zero-score trust report after its canonical read fails', async () => {
 setup('read'); await expect(publishEvent(event)).rejects.toMatchObject({ message: 'read denied' }); expect(writes).not.toHaveBeenCalled();
});
it.each(['trust','timeline','portfolio','opportunity','compass'])('rejects achievement event delivery when %s persistence fails', async (failure) => {
 setup(failure); await expect(publishEvent(event)).rejects.toMatchObject({ message: `${failure} write denied`, code: '42501' });
});
it('finishes only after all five derived writes succeed', async () => {
 setup('none'); await expect(publishEvent(event)).resolves.toBe(event);
 expect(writes.mock.calls.map(call => call[0])).toEqual(['trust_reports','timeline_events','timeline_events','opportunity_matches','opportunity_matches']);
});

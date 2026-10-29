// @vitest-environment node
import { afterEach,beforeEach,describe,it,expect,vi } from "vitest";
const mocks=vi.hoisted(()=>({generate:vi.fn(),fetch:vi.fn()}));
vi.mock('ai',()=>({generateText:mocks.generate,isStepCount:()=>()=>true}));
vi.mock('@ai-sdk/gateway',()=>({gateway:{tools:{perplexitySearch:(config:unknown)=>config}}}));
import {lookupBusiness} from '@/lib/verification/registry';
import {STATE_REGISTRIES} from '@/lib/verification/stateRegistries';
beforeEach(()=>{vi.resetAllMocks();vi.stubGlobal('fetch',mocks.fetch);for(const k of ['AI_GATEWAY_API_KEY','VERCEL_OIDC_TOKEN','CA_SOS_API_KEY'])vi.stubEnv(k,'');});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
describe('official business registry research',()=>{
 it('has a state/territory directory with California official business search',()=>{expect(STATE_REGISTRIES.length).toBeGreaterThanOrEqual(51);expect(STATE_REGISTRIES.find(x=>x.name==='California')?.url).toBe('https://bizfileonline.sos.ca.gov/search/business');});
 it('reports missing integration as unavailable, never a negative registration determination',async()=>{const r=await lookupBusiness({organizationName:'Example',formationState:'California',entityNumber:''});expect(r.status).toBe('unavailable');expect(r.humanReviewRequired).toBe(true);expect(mocks.fetch).not.toHaveBeenCalled();});
 it('uses the documented keyed California API with encoded query parameters',async()=>{vi.stubEnv('CA_SOS_API_KEY','test-only');mocks.fetch.mockResolvedValue(Response.json({EntityData:[{EntityName:'Example LLC',EntityID:'123',StatusDescription:'Active',AgentName:'Not passed into candidate'}]}));const r=await lookupBusiness({organizationName:'Example LLC',formationState:'California',entityNumber:''});expect(r.status).toBe('candidates_found');expect(r.candidates).toEqual([{name:'Example LLC',entityNumber:'123',standing:'Active'}]);expect(mocks.fetch.mock.calls[0][0].hostname).toBe('calico.sos.ca.gov');});
 it('does not treat API errors as no registration',async()=>{vi.stubEnv('CA_SOS_API_KEY','test-only');mocks.fetch.mockResolvedValue(Response.json({}, {status:503}));const r=await lookupBusiness({organizationName:'Example',formationState:'California',entityNumber:'123'});expect(r.status).toBe('unavailable');});
 it('allows only official research citations and keeps AI output advisory',async()=>{vi.stubEnv('VERCEL_OIDC_TOKEN','test-only');mocks.generate.mockResolvedValue({text:'Compare entity details with the official record.',sources:[{sourceType:'url',url:'https://bizfileonline.sos.ca.gov/search/business',title:'Official'},{sourceType:'url',url:'https://untrusted.example/guess',title:'Untrusted'}],toolResults:[]});const r=await lookupBusiness({organizationName:'Example',formationState:'California',entityNumber:''});expect(r.status).toBe('research_available');expect(r.sources).toHaveLength(1);expect(r.confidenceScore).toBe(0.25);expect(r.model).toBe('openai/gpt-5.4-mini');expect(r.humanReviewRequired).toBe(true);const input=mocks.generate.mock.calls[0][0];expect(input.tools.perplexity_search.searchDomainFilter).toEqual(['bizfileonline.sos.ca.gov']);expect(input.prompt).not.toContain('safety_answers');});
});

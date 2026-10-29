// @vitest-environment jsdom
import { fireEvent,render,screen,waitFor,cleanup } from '@testing-library/react';
import { afterEach,describe,it,expect,vi } from 'vitest';
import CommunityVettingJourney from '@/components/trust/CommunityVettingJourney';
import {COMMUNITY_POLICY_VERSION} from '@/lib/trust/communityStandards';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe('modular community acknowledgement',()=>{
 it('requires all modules and explicit consent; only unlocks after the server records it',async()=>{
  const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({accepted:false})}).mockResolvedValueOnce({ok:true,json:async()=>({accepted:true})});vi.stubGlobal('fetch',fetcher);const accepted=vi.fn();
  render(<CommunityVettingJourney onAccepted={accepted}/>);
  await waitFor(()=>expect((screen.getByRole('button',{name:'Continue'}) as HTMLButtonElement).disabled).toBe(false));
  for(let step=0;step<3;step++)fireEvent.click(screen.getByRole('button',{name:'Continue'}));
  expect((screen.getByRole('button',{name:'Agree and continue to verification'}) as HTMLButtonElement).disabled).toBe(true);
  expect(accepted).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'Agree and continue to verification'}));
  await waitFor(()=>expect(accepted).toHaveBeenCalledOnce());
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({version:COMMUNITY_POLICY_VERSION,acknowledged:true});
  expect(screen.getByRole('region',{name:'Community standards acknowledged'})).toBeTruthy();
 });
 it('keeps access locked when recording acknowledgement fails',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({accepted:false})}).mockResolvedValueOnce({ok:false,json:async()=>({error:'Try again'})}));const accepted=vi.fn();render(<CommunityVettingJourney onAccepted={accepted}/>);
  await waitFor(()=>expect((screen.getByRole('button',{name:'Continue'}) as HTMLButtonElement).disabled).toBe(false));
  for(let step=0;step<3;step++)fireEvent.click(screen.getByRole('button',{name:'Continue'}));fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'Agree and continue to verification'}));
  await waitFor(()=>expect(screen.getByRole('alert').textContent).toBe('Try again'));expect(accepted).not.toHaveBeenCalled();
 });
});

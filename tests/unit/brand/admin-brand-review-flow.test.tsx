import React from "react";
import { cleanup,fireEvent,render,screen,waitFor } from "@testing-library/react";
import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
const mocks=vi.hoisted(()=>({getUser:vi.fn(),fetch:vi.fn(),replace:vi.fn(),noDocuments:false}));
vi.mock("next/navigation",()=>({useRouter:()=>({replace:mocks.replace}),usePathname:()=>"/admin"}));
vi.mock("@/lib/supabaseClient",()=>({supabase:{auth:{getUser:mocks.getUser}}}));
import AdminPage from "@/app/admin/page";
const requestId="11111111-1111-4111-8111-111111111111";
const row={request_type:"brand-partner",request_id:requestId,status:"pending",submitted_at:"2026-10-28T18:25:00Z",evidence:{organization_name:"Example Brand"}};
beforeEach(()=>{
 vi.resetAllMocks();mocks.noDocuments=false;mocks.getUser.mockResolvedValue({data:{user:{id:"reviewer"}}});
 mocks.fetch.mockImplementation(async(url:string,init?:RequestInit)=>{
  if(url.includes("/communications"))return Response.json({communications:[]});
  if(url.includes("/brand-review")&&init?.method==="POST")return Response.json({saved:true,delivery:{status:"sent",message:"Accepted by mail server"}});
  if(url.includes("/brand-review"))return Response.json({registry:{human_outcome:"matched_active",source_url:"https://sos.ca.gov",review_note:"Reviewed",safety_reviewed:true},registration:{formation_state:"California",entity_type:"LLC",entity_number:"123",safety_answers:{}}});
  if(url.includes("brand-evidence"))return Response.json({documents:!url.includes("requestId=")||mocks.noDocuments?[]:[{name:"business-card.jpg",type:"Business card",url:"/api/admin/verification/brand-evidence/file?documentId=example"}]});
  return Response.json({requests:[row]});
 });vi.stubGlobal("fetch",mocks.fetch);
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe("admin dashboard review and invitation",()=>{
 it("requires document acknowledgement and explicit scopes before approval and email",async()=>{
  render(<AdminPage/>);await screen.findByText("Example Brand");
  fireEvent.change(screen.getByLabelText("Review outcome"),{target:{value:"approved"}});
  const approve=screen.getByRole("button",{name:"Approve and send invitation"}) as HTMLButtonElement;expect(approve.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button",{name:"Open submitted evidence"}));
  expect((await screen.findByRole("link",{name:/Business card — view/})).getAttribute("href")).toContain("/brand-evidence/file");
  fireEvent.click(screen.getByRole("checkbox",{name:/I reviewed the business documentation/}));expect(approve.disabled).toBe(true);
  fireEvent.click(screen.getByRole("checkbox",{name:/Approve the requested Brand Partner campaign/}));
  fireEvent.click(screen.getByRole("checkbox",{name:/Approve the requested student-protection/}));expect(approve.disabled).toBe(false);
  fireEvent.click(approve);
  await waitFor(()=>expect(mocks.fetch).toHaveBeenCalledWith("/api/admin/verification/brand-review",expect.objectContaining({method:"POST",body:expect.stringContaining('"outcome":"approved"')})));
 });
 it("blocks approval without supporting documents",async()=>{
  mocks.noDocuments=true;render(<AdminPage/>);await screen.findByText("Example Brand");fireEvent.change(screen.getByLabelText("Review outcome"),{target:{value:"approved"}});
  fireEvent.click(screen.getByRole("button",{name:"Open submitted evidence"}));await screen.findByText(/No business documents on file/);
  expect((screen.getByRole("button",{name:"Approve and send invitation"}) as HTMLButtonElement).disabled).toBe(true);
 });
 it("does not expose review controls to a non-reviewer",async()=>{
  mocks.fetch.mockResolvedValue(Response.json({error:"Reviewer authority required"},{status:403}));render(<AdminPage/>);await screen.findByText("Reviewer authority required");expect(screen.queryByRole("button",{name:"Open submitted evidence"})).toBeNull();
 });
 it("selects an additional-information template without including private notes in its preview",async()=>{
  render(<AdminPage/>);await screen.findByText("Example Brand");
  fireEvent.change(screen.getByLabelText("Applicant-facing reason"),{target:{value:"legal_name_mismatch"}});
  fireEvent.change(screen.getByLabelText("Private admin notes"),{target:{value:"Staff-only investigation context"}});
  expect(screen.getByLabelText("Email preview").textContent).toContain("DBA");expect(screen.getByLabelText("Email preview").textContent).not.toContain("Staff-only");
 });
});

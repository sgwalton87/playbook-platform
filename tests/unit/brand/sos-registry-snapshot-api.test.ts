// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks=vi.hoisted(()=>({
 requireUser:vi.fn(), rpc:vi.fn(), upload:vi.fn(), download:vi.fn(),
 dbInsert:vi.fn(), dbSelect:vi.fn(),
}));
vi.mock("@/lib/supabase/server",()=>({requireUser:mocks.requireUser}));
import { POST, GET } from "@/app/api/admin/verification/registry/snapshot/route";
import { GET as GETImage } from "@/app/api/admin/verification/registry/snapshot/file/route";
const requestId="11111111-1111-4111-8111-111111111111";
const imageId="22222222-2222-4222-8222-222222222222";
const userId="33333333-3333-4333-8333-333333333333";
const pngHeader=Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,0,0,0,0,0]);
const base="/api/admin/verification/registry/snapshot";
const get=(url=base)=>new NextRequest("http://localhost"+url);
function post(data:FormData){return new NextRequest("http://localhost"+base,{method:"POST",body:data});}
function form(){
 const data=new FormData();data.set("requestId",requestId);
 data.set("sourceUrl","https://bizfileonline.sos.ca.gov/search/business");
 data.set("file",new File([pngHeader],"official.png",{type:"image/png"}));
 return data;
}
beforeEach(()=>{
 vi.resetAllMocks();
 mocks.rpc.mockResolvedValue({data:{organizationName:"Test LLC",registration:{}},error:null});
 mocks.upload.mockResolvedValue({data:{path:"retained"},error:null});
 mocks.download.mockResolvedValue({data:new Blob([pngHeader],{type:"image/png"}),error:null});
 mocks.dbInsert.mockResolvedValue({error:null});
 mocks.dbSelect.mockReturnValue({eq:()=>({eq:()=>({maybeSingle:async()=>({data:{storage_path:"path.png"},error:null})})})});
 mocks.requireUser.mockResolvedValue({user:{id:userId},supabase:{
  rpc:mocks.rpc,
  storage:{from:()=>({upload:mocks.upload,download:mocks.download})},
  from:()=>({insert:mocks.dbInsert,select:mocks.dbSelect}),
 }});
});
describe("reviewer-provided California SOS snapshots",()=>{
 it("rejects unauthenticated evidence without storage writes",async()=>{
  mocks.requireUser.mockResolvedValue({user:null});
  expect((await POST(post(form()))).status).toBe(401);
  expect(mocks.upload).not.toHaveBeenCalled();
 });
 it("requires an official SOS host, preventing arbitrary links",async()=>{
  const data=form();data.set("sourceUrl","https://bizfileonline.sos.ca.gov.attacker.example/search/business");
  expect((await POST(post(data))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("accepts a selected-tab screenshot only after reviewer authority check",async()=>{
  const response=await POST(post(form()));
  expect(response.status).toBe(201);
  expect((await response.json()).saved).toBe(true);
  expect(mocks.rpc).toHaveBeenCalledWith("get_brand_review_context",{requested_id:requestId});
  expect(mocks.upload).toHaveBeenCalledTimes(1);
  expect(mocks.dbInsert).toHaveBeenCalledWith(expect.objectContaining({
   reviewer_id:userId,request_id:requestId,file_sha256:expect.stringMatching(/^[a-f0-9]{64}$/),
  }));
 });
 it("does not store images when reviewer authorization is denied",async()=>{
  mocks.rpc.mockResolvedValue({data:null,error:{code:"42501"}});
  expect((await POST(post(form()))).status).toBe(403);
  expect(mocks.upload).not.toHaveBeenCalled();
 });
 it("refuses forged image contents",async()=>{
  const data=form();data.set("file",new File(["not a screenshot, just text"],"bad.png",{type:"image/png"}));
  expect((await POST(post(data))).status).toBe(400);
  expect(mocks.upload).not.toHaveBeenCalled();
 });
 it("denies image retrieval without a session",async()=>{
  mocks.requireUser.mockResolvedValue({user:null});
  expect((await GETImage(get(base+`/file?requestId=${requestId}&id=${imageId}`))).status).toBe(401);
 });
 it("denies audit metadata listing without a session",async()=>{
  mocks.requireUser.mockResolvedValue({user:null});
  expect((await GET(get(base+`?requestId=${requestId}`))).status).toBe(401);
 });
});

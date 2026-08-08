import { describe,expect,it } from "vitest";
import { normalizeNotificationEvent,notificationAction,notificationMode,notificationPriorityForAttempt,notificationType } from "@/lib/pbos/reliable-notifications";
describe("reliable notifications",()=>{
  it("normalizes valid domain events and rejects unsafe destinations",()=>{expect(normalizeNotificationEvent({eventKey:"event-1",type:"message",title:"Reply",body:"New reply",href:"/messages",priority:"medium"}).type).toBe("message");
    expect(()=>normalizeNotificationEvent({eventKey:"event-2",type:"message",title:"Reply",body:"New reply",href:"https://evil.example",priority:"medium"})).toThrow("invalid");});
  it("escalates bounded retries and validates actions and preferences",()=>{expect(notificationPriorityForAttempt("low",2)).toBe("high");expect(notificationPriorityForAttempt("medium",3)).toBe("urgent");
    expect(notificationAction("RETRY")).toBe("RETRY");expect(()=>notificationAction("DELETE")).toThrow("not governed");expect(notificationMode("muted")).toBe("muted");
    expect(notificationType("message")).toBe("message");expect(()=>notificationType("unknown")).toThrow("type is invalid");});
});

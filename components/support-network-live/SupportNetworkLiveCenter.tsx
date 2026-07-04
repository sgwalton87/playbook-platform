"use client";

import { useState } from "react";
import {
  createSupportMessage,
  getDemoSharedActions,
  getDemoSupportThread,
} from "@/lib/support-network-live";

export default function SupportNetworkLiveCenter() {
  const [body, setBody] = useState("");
  const [messages, setMessages] = useState(getDemoSupportThread());
  const actions = getDemoSharedActions();

  function sendMessage() {
    if (!body.trim()) return;

    setMessages([
      createSupportMessage({
        scholarId: "scholar-maya",
        senderRole: "family",
        body,
      }),
      ...messages,
    ]);

    setBody("");
  }

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Support Network Messaging</p>
        <h1 style={title}>Coordinate around goals, deadlines, evidence, and opportunities.</h1>
        <p style={sub}>Supporters can send free-text DMs and coordinate shared actions around one scholar record.</p>
      </section>

      <section style={grid}>
        <article style={card}>
          <p style={eyebrow}>Shared Actions</p>
          <h2 style={cardTitle}>What needs to happen next</h2>
          {actions.map(action => (
            <div key={action.title} style={item}>
              <strong>{action.title}</strong>
              <span>{action.assigned_role}</span>
              <p>{action.detail}</p>
            </div>
          ))}
        </article>

        <article style={card}>
          <p style={eyebrow}>Free Text DMs</p>
          <h2 style={cardTitle}>Support thread</h2>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Send a message to the support network..."
            style={textarea}
          />

          <button onClick={sendMessage} style={button}>Send message</button>

          <div style={{display:"grid",gap:10,marginTop:16}}>
            {messages.map((msg, i) => (
              <div key={`${msg.sender_role}-${i}`} style={message}>
                <strong>{msg.sender_role}</strong>
                <p>{msg.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"};
const hero: React.CSSProperties = {maxWidth:1120,margin:"0 auto 18px",background:"#0F172A",color:"#fff",borderRadius:30,padding:34};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const title: React.CSSProperties = {fontSize:50,lineHeight:1,margin:"12px 0"};
const sub: React.CSSProperties = {color:"#CBD5E1",fontSize:17,lineHeight:1.6};
const grid: React.CSSProperties = {maxWidth:1120,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const cardTitle: React.CSSProperties = {color:"#0F172A",fontSize:25,margin:"8px 0 16px"};
const item: React.CSSProperties = {border:"1px solid #E2E8F0",borderRadius:16,padding:14,marginBottom:10,color:"#0F172A"};
const textarea: React.CSSProperties = {width:"100%",boxSizing:"border-box",minHeight:110,border:"1px solid #E2E8F0",borderRadius:16,padding:14};
const button: React.CSSProperties = {marginTop:10,background:"#F97316",color:"#fff",border:"none",borderRadius:999,padding:"10px 13px",fontWeight:950};
const message: React.CSSProperties = {background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:16,padding:14,color:"#0F172A"};

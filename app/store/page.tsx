"use client";

import AppShell from "@/components/AppShell";
import { rewardStore } from "@/lib/store";

export default function StorePage() {
  return (
    <main style={{ padding: 20 }}>
      <h1>🛒 XP Store</h1>

      {rewardStore.map((item) => (
        <div
          key={item.id}
          style={{
            padding: 12,
            marginBottom: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <strong>{item.cost} XP</strong>
        </div>
      ))}
    </main>
  );
}
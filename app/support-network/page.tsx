"use client";

import LiveSupportRelationships from "@/components/support-network/LiveSupportRelationships";
import SupportNetworkMap from "@/components/support-network/SupportNetworkMap";

export default function SupportNetworkPage() {
  return (
    <>
      <SupportNetworkMap />
      <LiveSupportRelationships />
    </>
  );
}

"use client";

import LiveSupportRelationships from "@/components/support-network/LiveSupportRelationships";
import RelationshipSecurityHistory from "@/components/support-network/RelationshipSecurityHistory";
import SupportNetworkMap from "@/components/support-network/SupportNetworkMap";

export default function SupportNetworkPage() {
  return (
    <>
      <SupportNetworkMap />
      <LiveSupportRelationships />
      <RelationshipSecurityHistory />
    </>
  );
}

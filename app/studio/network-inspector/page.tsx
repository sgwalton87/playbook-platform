"use client";

import NetworkIntelligenceDashboard from "@/components/network-intelligence/NetworkIntelligenceDashboard";
import ScholarNetworkDashboard from "@/components/scholar-network/ScholarNetworkDashboard";

export default function StudioNetworkInspectorPage() {
  return (
    <>
      <NetworkIntelligenceDashboard />
      <ScholarNetworkDashboard />
    </>
  );
}

"use client";

import {
  canRelationship,
  type Permission,
  type RelationshipKind,
} from "@/lib/permissions";

export default function PermissionGate({
  relationship,
  permission,
  children,
  fallback,
}: {
  relationship: RelationshipKind;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (canRelationship(relationship, permission)) {
    return <>{children}</>;
  }

  return (
    <>
      {fallback || (
        <section style={locked}>
          <strong>Locked for this relationship</strong>
          <p style={{ margin: "6px 0 0" }}>
            This action requires <code>{permission}</code> access.
          </p>
        </section>
      )}
    </>
  );
}

const locked: React.CSSProperties = {
  background: "#F8FAFC",
  border: "1px dashed #CBD5E1",
  borderRadius: 16,
  padding: 14,
  color: "#64748B",
  fontSize: 13,
};

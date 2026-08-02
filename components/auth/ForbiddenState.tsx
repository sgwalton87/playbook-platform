import Link from "next/link";

export default function ForbiddenState({ reason = "You do not have permission to view this Scholar surface." }: { reason?: string }) {
  return (
    <main style={{ maxWidth: 720, margin: "64px auto", padding: 32 }}>
      <p style={{ color: "#B45309", fontWeight: 700 }}>Access restricted</p>
      <h1>Permission required</h1>
      <p>{reason}</p>
      <Link href="/home">Return to Playbook Home</Link>
    </main>
  );
}

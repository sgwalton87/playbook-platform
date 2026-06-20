"use client";

export default function Toast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "black",
        color: "white",
        padding: 14,
        borderRadius: 10,
        animation: "pop 0.3s ease",
        zIndex: 9999,
      }}
    >
      {message}

      <style jsx>{`
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
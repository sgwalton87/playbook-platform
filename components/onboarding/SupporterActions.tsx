"use client";

type Props = {
  onCancel?: () => void;
  status: "draft" | "invited" | "pending" | "connected";
  onEdit: () => void;
  onDelete: () => void;
};

export default function SupporterActions({
  status,
  onEdit,
  onDelete,
  onCancel,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 16,
      }}
    >
      <button
        type="button"
        onClick={onEdit}
        style={buttonStyle}
      >
        ✏️ Edit
      </button>

      <button
        type="button"
        onClick={() => {
          if (confirm("Remove this supporter?")) {
            onDelete();
          }
        }}
        style={{
          ...buttonStyle,
          color: "#DC2626",
          borderColor: "#FECACA",
          background: "#FFF7F7",
        }}
      >
        🗑 Remove
      </button>

      {(status === "invited" || status === "pending") && (
        <>
          <button
            type="button"
            onClick={onEdit}
            style={buttonStyle}
          >
            📧 Resend
          </button>

          <button
            type="button"
            onClick={()=>{
              if(confirm("Cancel this invitation?")){
                onCancel?.();
              }
            }}
            style={{
              ...buttonStyle,
              color:"#B91C1C",
              borderColor:"#FECACA",
            }}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 700,
};

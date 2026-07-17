"use client";

type Props = {
  fieldKey: string;
  label: string;
  value: unknown;
  options: string[];
  helpText?: string;
  error?: string;
  maxSelections?: number;
  onChange: (value: string[]) => void;
};

function normalizePriorities(
  value: unknown,
  validOptions: string[]
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const valid = new Set(validOptions);

  return Array.from(
    new Set(
      value
        .map((item) => String(item || "").trim())
        .filter((item) => valid.has(item))
    )
  );
}

export default function PriorityListField({
  fieldKey,
  label,
  value,
  options,
  helpText,
  error,
  maxSelections,
  onChange,
}: Props) {
  const priorities = normalizePriorities(
    value,
    options
  );

  const unselected = options.filter(
    (option) => !priorities.includes(option)
  );

  function addPriority(option: string) {
    if (
      maxSelections &&
      priorities.length >= maxSelections
    ) {
      return;
    }

    onChange([...priorities, option]);
  }

  function removePriority(option: string) {
    onChange(
      priorities.filter(
        (priority) => priority !== option
      )
    );
  }

  function movePriority(
    index: number,
    direction: -1 | 1
  ) {
    const destination = index + direction;

    if (
      destination < 0 ||
      destination >= priorities.length
    ) {
      return;
    }

    const next = [...priorities];

    [next[index], next[destination]] = [
      next[destination],
      next[index],
    ];

    onChange(next);
  }

  return (
    <section
      data-field-key={fieldKey}
      style={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          marginBottom: 6,
          color: "#0F172A",
          fontSize: 15,
          fontWeight: 900,
        }}
      >
        {label}
      </div>

      <p
        style={{
          margin: "0 0 14px",
          color: "#64748B",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {helpText ||
          "Select your priorities in order. Number 1 is your highest priority."}

        {maxSelections ? (
          <span
            style={{
              display: "block",
              marginTop: 5,
              color:
                priorities.length >= maxSelections
                  ? "#C2410C"
                  : "#64748B",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {priorities.length} of {maxSelections} selected
          </span>
        ) : null}
      </p>

      <div
        style={{
          padding: 16,
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          background: "#F8FAFC",
        }}
      >
        {priorities.length ? (
          <ol
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 9,
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {priorities.map(
              (priority, index) => (
                <li
                  key={priority}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "38px minmax(0, 1fr) auto",
                    gap: 10,
                    alignItems: "center",
                    padding: 11,
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: 11,
                    background: "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "#FFF7ED",
                      color: "#C2410C",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {priority}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Move ${priority} up`}
                      disabled={index === 0}
                      onClick={() =>
                        movePriority(index, -1)
                      }
                      style={{
                        padding: "7px 9px",
                        border:
                          "1px solid #CBD5E1",
                        borderRadius: 8,
                        background: "#FFFFFF",
                        color:
                          index === 0
                            ? "#94A3B8"
                            : "#0F172A",
                        cursor:
                          index === 0
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: 900,
                      }}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      aria-label={`Move ${priority} down`}
                      disabled={
                        index ===
                        priorities.length - 1
                      }
                      onClick={() =>
                        movePriority(index, 1)
                      }
                      style={{
                        padding: "7px 9px",
                        border:
                          "1px solid #CBD5E1",
                        borderRadius: 8,
                        background: "#FFFFFF",
                        color:
                          index ===
                          priorities.length - 1
                            ? "#94A3B8"
                            : "#0F172A",
                        cursor:
                          index ===
                          priorities.length - 1
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: 900,
                      }}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removePriority(priority)
                      }
                      style={{
                        padding: "7px 9px",
                        border:
                          "1px solid #FECACA",
                        borderRadius: 8,
                        background: "#FEF2F2",
                        color: "#B91C1C",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            )}
          </ol>
        ) : (
          <p
            style={{
              margin: 0,
              color: "#64748B",
              fontSize: 13,
            }}
          >
            No priorities selected yet.
          </p>
        )}

        {unselected.length ? (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop:
                "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                marginBottom: 8,
                color: "#475569",
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Add another priority
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {unselected.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={
                    Boolean(
                      maxSelections &&
                        priorities.length >=
                          maxSelections
                    )
                  }
                  onClick={() =>
                    addPriority(option)
                  }
                  style={{
                    padding: "9px 11px",
                    border:
                      "1px solid #CBD5E1",
                    borderRadius: 999,
                    background:
                      maxSelections &&
                      priorities.length >=
                        maxSelections
                        ? "#F1F5F9"
                        : "#FFFFFF",
                    color:
                      maxSelections &&
                      priorities.length >=
                        maxSelections
                        ? "#94A3B8"
                        : "#0F172A",
                    cursor:
                      maxSelections &&
                      priorities.length >=
                        maxSelections
                        ? "not-allowed"
                        : "pointer",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  + {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 8,
            color: "#B91C1C",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      ) : null}
    </section>
  );
}

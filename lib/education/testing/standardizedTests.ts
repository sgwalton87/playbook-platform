export type StandardizedTestName =
  | "SAT"
  | "ACT";

export type StandardizedTestStatus =
  | ""
  | "taken"
  | "planning"
  | "skip";

export type StandardizedTestAttempt = {
  id: string;
  date: string;
  score: string;
};

export type StandardizedTestPlannedDate = {
  id: string;
  date: string;
};

export type StandardizedTestPlan = {
  status: StandardizedTestStatus;

  completedAttempts:
    StandardizedTestAttempt[];

  plannedDates:
    StandardizedTestPlannedDate[];

  skipReason: string;
  skipSavedAt: string | null;
};

function createId(prefix: string): string {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${prefix}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`
  );
}

export function emptyTestPlan():
  StandardizedTestPlan {
  return {
    status: "",
    completedAttempts: [],
    plannedDates: [],
    skipReason: "",
    skipSavedAt: null,
  };
}

export function createTestAttempt():
  StandardizedTestAttempt {
  return {
    id: createId("attempt"),
    date: "",
    score: "",
  };
}

export function createPlannedTestDate():
  StandardizedTestPlannedDate {
  return {
    id: createId("planned"),
    date: "",
  };
}

function normalizeCompletedAttempts(
  value: unknown
): StandardizedTestAttempt[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        return null;
      }

      const row = item as Record<
        string,
        unknown
      >;

      const date = String(
        row.date || ""
      ).trim();

      const score = String(
        row.score || ""
      ).trim();

      if (!date && !score) {
        return null;
      }

      return {
        id:
          String(row.id || "").trim() ||
          `attempt-${index}`,
        date,
        score,
      };
    })
    .filter(
      (
        attempt
      ): attempt is StandardizedTestAttempt =>
        attempt !== null
    );
}

function normalizePlannedDates(
  value: unknown
): StandardizedTestPlannedDate[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        return null;
      }

      const row = item as Record<
        string,
        unknown
      >;

      const date = String(
        row.date || ""
      ).trim();

      if (!date) {
        return null;
      }

      return {
        id:
          String(row.id || "").trim() ||
          `planned-${index}`,
        date,
      };
    })
    .filter(
      (
        planned
      ): planned is StandardizedTestPlannedDate =>
        planned !== null
    );
}

export function normalizeTestPlan(
  value: unknown
): StandardizedTestPlan {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return emptyTestPlan();
  }

  const input =
    value as Record<string, unknown>;

  const allowedStatuses:
    StandardizedTestStatus[] = [
      "",
      "taken",
      "planning",
      "skip",
    ];

  const status =
    allowedStatuses.includes(
      input.status as StandardizedTestStatus
    )
      ? (
          input.status as StandardizedTestStatus
        )
      : "";

  let completedAttempts =
    normalizeCompletedAttempts(
      input.completedAttempts ??
        input.completed_attempts
    );

  let plannedDates =
    normalizePlannedDates(
      input.plannedDates ??
        input.planned_dates
    );

  /*
   * Backward compatibility:
   * Older records stored both completed and
   * planned entries inside one `attempts` array.
   */
  if (
    completedAttempts.length === 0 &&
    plannedDates.length === 0 &&
    Array.isArray(input.attempts)
  ) {
    if (status === "taken") {
      completedAttempts =
        normalizeCompletedAttempts(
          input.attempts
        );
    }

    if (status === "planning") {
      plannedDates =
        normalizePlannedDates(
          input.attempts
        );
    }
  }

  return {
    status,
    completedAttempts,
    plannedDates,

    /*
     * Do not trim this while typing.
     * Trimming here previously deleted spaces.
     */
    skipReason: String(
      input.skipReason ??
        input.skip_reason ??
        ""
    ),

    skipSavedAt:
      input.skipSavedAt ||
      input.skip_saved_at
        ? String(
            input.skipSavedAt ??
              input.skip_saved_at
          )
        : null,
  };
}

export function getHighestTestScore(
  plan: StandardizedTestPlan
): string | null {
  const scores =
    plan.completedAttempts
      .map((attempt) =>
        Number(attempt.score)
      )
      .filter((score) =>
        Number.isFinite(score)
      );

  return scores.length
    ? String(Math.max(...scores))
    : null;
}

import { supabase } from "@/lib/supabaseClient";

import { assembleScholarRecord } from "./assembleScholarRecord";
import type { ScholarRecord } from "./types";

type LoadScholarRecordOptions = {
  userId?: string | null;
  includeAcademicData?: boolean;
};

type LoadScholarRecordResult = {
  record: ScholarRecord | null;
  error: Error | null;
};

async function loadAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      user: null,
      error: new Error(error.message),
    };
  }

  return {
    user,
    error: null,
  };
}

async function loadProfileRow(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      profile: null,
      error: new Error(error.message),
    };
  }

  return {
    profile: data,
    error: null,
  };
}

async function loadAgProgress(userId: string) {
  const { data, error } = await supabase
    .from("ag_progress")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.warn(
      "Scholar Record could not load A-G progress:",
      error.message
    );

    return [];
  }

  return data || [];
}

async function loadTranscriptCourses(userId: string) {
  const attempts = [
    async () =>
      supabase
        .from("transcript_courses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: true,
        }),

    async () =>
      supabase
        .from("academic_courses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: true,
        }),
  ];

  for (const attempt of attempts) {
    const { data, error } = await attempt();

    if (!error) {
      return data || [];
    }

    const missingTable =
      error.code === "42P01" ||
      error.message
        .toLowerCase()
        .includes("could not find the table") ||
      error.message
        .toLowerCase()
        .includes("does not exist");

    if (!missingTable) {
      console.warn(
        "Scholar Record could not load transcript courses:",
        error.message
      );

      return [];
    }
  }

  return [];
}

export async function loadScholarRecord({
  userId,
  includeAcademicData = true,
}: LoadScholarRecordOptions = {}): Promise<LoadScholarRecordResult> {
  const authResult = await loadAuthenticatedUser();

  if (authResult.error) {
    return {
      record: null,
      error: authResult.error,
    };
  }

  const resolvedUserId =
    userId || authResult.user?.id || null;

  if (!resolvedUserId) {
    return {
      record: null,
      error: new Error(
        "No authenticated scholar was found."
      ),
    };
  }

  try {
    const record = await assembleScholarRecord({
      userId: resolvedUserId,
      authEmail: authResult.user?.email || null,
      includeAcademicData,
      dependencies: {
        loadProfile: async (id) => {
          const result = await loadProfileRow(id);

          if (result.error) {
            throw result.error;
          }

          return result.profile;
        },

        loadAgProgress,

        loadTranscriptCourses,
      },
    });

    if (!record) {
      return {
        record: null,
        error: new Error(
          "No profile record was found for this scholar."
        ),
      };
    }

    return {
      record,
      error: null,
    };
  } catch (error) {
    return {
      record: null,
      error:
        error instanceof Error
          ? error
          : new Error(
              "The Scholar Record could not be loaded."
            ),
    };
  }
}

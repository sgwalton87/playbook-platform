"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { loadScholarRecord } from "./loadScholarRecord";
import type { ScholarRecord } from "./types";

type UseScholarRecordOptions = {
  userId?: string | null;
  includeAcademicData?: boolean;
  enabled?: boolean;
};

export function useScholarRecord({
  userId,
  includeAcademicData = true,
  enabled = true,
}: UseScholarRecordOptions = {}) {
  const [record, setRecord] =
    useState<ScholarRecord | null>(null);

  const [loading, setLoading] =
    useState(enabled);

  const [error, setError] =
    useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);

    const result = await loadScholarRecord({
      userId,
      includeAcademicData,
    });

    setRecord(result.record);
    setError(result.error);
    setLoading(false);

    return result.record;
  }, [
    enabled,
    includeAcademicData,
    userId,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    record,
    loading,
    error,
    refresh,
    setRecord,
  };
}

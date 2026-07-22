"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { loadPlaybookRecord } from "./loadPlaybookRecord";
import type { PlaybookRecord } from "./types";

type UsePlaybookRecordOptions = {
  userId?: string | null;
  includeAcademicData?: boolean;
  enabled?: boolean;
};

export function usePlaybookRecord({
  userId,
  includeAcademicData = true,
  enabled = true,
}: UsePlaybookRecordOptions = {}) {
  const [record, setRecord] =
    useState<PlaybookRecord | null>(null);

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

    const result = await loadPlaybookRecord({
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

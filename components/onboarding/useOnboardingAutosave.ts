"use client";

import { useEffect, useRef } from "react";

type AutosaveInput = {
  enabled: boolean;
  userId?: string | null;
  stepIndex: number;
  form: Record<string, unknown>;
  isBusy?: boolean;
  delayMs?: number;
  onSave: () => Promise<void>;
};

export function useOnboardingAutosave({
  enabled,
  userId,
  stepIndex,
  form,
  isBusy = false,
  delayMs = 2500,
  onSave,
}: AutosaveInput) {
  const saveCallbackRef = useRef(onSave);
  const savingRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    saveCallbackRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled || !userId || isBusy) return;

    const snapshot = JSON.stringify({
      userId,
      stepIndex,
      form,
    });

    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    const timer = window.setTimeout(async () => {
      if (savingRef.current) return;

      savingRef.current = true;

      // Mark the current snapshot before saving so state normalization
      // inside persist() cannot create an immediate autosave loop.
      lastSavedSnapshotRef.current = snapshot;

      try {
        await saveCallbackRef.current();
      } catch (error) {
        // Permit this snapshot to retry after a future edit.
        lastSavedSnapshotRef.current = null;
        console.error("Onboarding autosave failed:", error);
      } finally {
        savingRef.current = false;
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [
    enabled,
    userId,
    stepIndex,
    form,
    isBusy,
    delayMs,
  ]);
}

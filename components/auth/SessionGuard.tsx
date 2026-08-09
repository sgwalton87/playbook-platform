"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { logout } from "@/lib/auth/logout";
import {
  getNextSessionCheckDelay,
  getSessionTimeoutState,
  SESSION_ACTIVITY_STORAGE_KEY,
} from "@/lib/auth/sessionTimeout";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/check-email",
  "/auth/callback",
  "/reset-password",
];

export default function SessionGuard() {
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const expiringRef = useRef(false);
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isPublic || !hasSession) {
      if (!isPublic) return;
      localStorage.removeItem(SESSION_ACTIVITY_STORAGE_KEY);
      expiringRef.current = false;
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastActivityAt = Date.now();

    async function expireSession() {
      if (expiringRef.current) return;
      expiringRef.current = true;
      localStorage.removeItem(SESSION_ACTIVITY_STORAGE_KEY);

      const result = await logout(supabase);
      if (!result.ok) {
        // If global revocation is temporarily unavailable, still remove this
        // browser's session before leaving an unattended authenticated route.
        await supabase.auth.signOut({ scope: "local" });
      }

      window.location.replace("/login?reason=session-timeout");
    }

    function scheduleCheck() {
      if (timer) clearTimeout(timer);
      const now = Date.now();
      const state = getSessionTimeoutState(lastActivityAt, now);
      setShowWarning(state === "warning");

      if (state === "expired") {
        void expireSession();
        return;
      }

      timer = setTimeout(scheduleCheck, getNextSessionCheckDelay(lastActivityAt, now));
    }

    function recordActivity() {
      lastActivityAt = Date.now();
      localStorage.setItem(SESSION_ACTIVITY_STORAGE_KEY, String(lastActivityAt));
      scheduleCheck();
    }

    function syncActivity(event: StorageEvent) {
      if (event.key !== SESSION_ACTIVITY_STORAGE_KEY || !event.newValue) return;
      const syncedActivity = Number(event.newValue);
      if (Number.isFinite(syncedActivity) && syncedActivity > lastActivityAt) {
        lastActivityAt = syncedActivity;
        scheduleCheck();
      }
    }

    function checkWhenVisible() {
      if (document.visibilityState === "visible") scheduleCheck();
    }

    const storedActivity = Number(localStorage.getItem(SESSION_ACTIVITY_STORAGE_KEY));
    if (Number.isFinite(storedActivity) && storedActivity > 0) {
      lastActivityAt = storedActivity;
    } else {
      localStorage.setItem(SESSION_ACTIVITY_STORAGE_KEY, String(lastActivityAt));
    }

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    window.addEventListener("storage", syncActivity);
    window.addEventListener("focus", scheduleCheck);
    document.addEventListener("visibilitychange", checkWhenVisible);
    scheduleCheck();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, recordActivity));
      window.removeEventListener("storage", syncActivity);
      window.removeEventListener("focus", scheduleCheck);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, [hasSession, isPublic, pathname]);

  if (isPublic || !hasSession || !showWarning) return null;

  return (
    <div className="playbook-session-warning" role="alertdialog" aria-modal="true" aria-labelledby="session-warning-title" aria-describedby="session-warning-description">
      <div className="playbook-session-warning__card">
        <p className="playbook-session-warning__eyebrow">Security check</p>
        <h2 id="session-warning-title">Are you still there?</h2>
        <p id="session-warning-description">
          Your session will end in less than a minute because there has been no activity.
        </p>
        <button type="button" autoFocus onClick={() => window.dispatchEvent(new Event("pointerdown"))}>
          Stay signed in
        </button>
      </div>
    </div>
  );
}

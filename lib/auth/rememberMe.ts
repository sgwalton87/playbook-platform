import type { CookieMethodsBrowser } from "@supabase/ssr";

const REMEMBER_ME_PREFERENCE = "playbook_remember_session";
const LEGACY_SAVED_EMAIL = "playbook_saved_email";

type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getRememberMePreference(storage?: BrowserStorage): boolean {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  return target?.getItem(REMEMBER_ME_PREFERENCE) === "true";
}

export function setRememberMePreference(
  remember: boolean,
  storage?: BrowserStorage
): void {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return;

  if (remember) {
    target.setItem(REMEMBER_ME_PREFERENCE, "true");
  } else {
    target.removeItem(REMEMBER_ME_PREFERENCE);
  }

  // Earlier login UI stored an email address under this key. Remember Me now
  // controls the session cookie only; identity fields are never retained here.
  target.removeItem(LEGACY_SAVED_EMAIL);
}

function parseCookies(source: string): Array<{ name: string; value: string }> {
  if (!source) return [];

  return source.split(";").flatMap((entry) => {
    const separator = entry.indexOf("=");
    if (separator < 1) return [];
    return [{
      name: entry.slice(0, separator).trim(),
      value: entry.slice(separator + 1).trim(),
    }];
  });
}

function serializeCookie(
  name: string,
  value: string,
  options: Parameters<NonNullable<CookieMethodsBrowser["setAll"]>>[0][number]["options"],
  remember: boolean
): string {
  const parts = [`${name}=${value}`];
  const path = options.path ?? "/";
  parts.push(`Path=${path}`);

  // Supabase clears stale token chunks with Max-Age=0. That deletion must
  // always survive, even when new sessions are browser-session scoped.
  if (options.maxAge === 0 || (remember && typeof options.maxAge === "number")) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  if (remember && options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.sameSite) {
    const sameSite = options.sameSite === true ? "Strict" : options.sameSite;
    parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);
  }
  if (options.secure) parts.push("Secure");

  return parts.join("; ");
}

export function createRememberMeCookieMethods(
  cookieSource: () => string,
  writeCookie: (cookie: string) => void,
  preferenceStorage: BrowserStorage
): CookieMethodsBrowser {
  return {
    getAll() {
      return parseCookies(cookieSource());
    },
    setAll(cookies) {
      const remember = getRememberMePreference(preferenceStorage);
      cookies.forEach(({ name, value, options }) => {
        writeCookie(serializeCookie(name, value, options, remember));
      });
    },
  };
}

export const rememberMeCookieMethods: CookieMethodsBrowser | undefined =
  typeof window === "undefined"
    ? undefined
    : createRememberMeCookieMethods(
        () => document.cookie,
        (cookie) => {
          document.cookie = cookie;
        },
        window.localStorage
      );

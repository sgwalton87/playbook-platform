# RCC-AUTH-024 — Google OAuth consent branding release

Status: CONFIGURATION PREPARED, GOOGLE CLOUD CHANGES NOT APPLIED.
Owner: Playbook Series Inc. Authorized identity administrator.
Goal: Google consent screen shows **Playbook Series Inc.** rather than the Supabase project host.

## Current verified context
- Public homepage: https://playbookseriesinc.org
- App: https://app.playbookseriesinc.org
- Supabase project reference: oexgxnybeixwadgtdtzp
- Supabase OAuth default callback: https://oexgxnybeixwadgtdtzp.supabase.co/auth/v1/callback
- App callbacks are implemented in app/login/page.tsx and app/auth/callback.
- The Google consent screen screenshot shows the default Supabase project host.
- The existing sign-in code uses signInWithOAuth({ provider: "google", options: { redirectTo: ... }}). Its UI does not control Google's consent text.

## Google Auth Platform (correct Google Cloud project required)
1. In https://console.cloud.google.com/auth/branding, identify the project owning the OAuth **web client** registered under Supabase Authentication → Providers → Google. Do NOT create a second OAuth client without an explicit migration decision.
2. App name: **Playbook Series Inc.** Use a properly licensed organization logo in a Google-compatible square image; verify the current approved official logo asset, rather than using a placeholder.
3. Support email: use an existing monitored organizational mailbox authorized by the founder; do not infer an address.
4. Home page: https://playbookseriesinc.org (verify current public messaging clearly identifies the same app).
5. Privacy policy URL and terms URL: must be live, publicly accessible, specific to Playbook and consistent with policies; do not enter unverified guessed paths.
6. Authorized domain: playbookseriesinc.org. Prove ownership in Google Search Console with an owner account linked to the OAuth project. Confirm additional domains used by registered origins and redirects.
7. Scopes: only openid, email and profile for basic identity, unless other Google access is specifically needed.
8. Review Google Auth Platform → Clients: preserve currently working redirect URI `https://oexgxnybeixwadgtdtzp.supabase.co/auth/v1/callback` until any custom-domain change has been validated. Supabase Auth provider configuration and Google web-client credentials must match exactly.
9. Submit the draft branding for Google verification and *publish* verified branding when the console allows. A saved draft does not imply published consent branding.

## Optional separate custom auth-domain decision
- A Supabase custom domain such as auth.playbookseriesinc.org requires plan/paid add-on eligibility, ownership, DNS verification and coordinated migration. Do NOT add a DNS record or swap callback origin independently.
- Reconfigure authorized Google redirect and Supabase/application URLs as a controlled cutover; confirm auth cookies, callback handling and session persistence. Never remove the working Supabase callback until success is proven.
- **No custom domain purchase or DNS migration is authorized by this document.**

## iPhone acceptance
1. On iOS Safari/Brave private session visit https://app.playbookseriesinc.org/login and select Google login.
2. Assert consent heading/app branding identifies **Playbook Series Inc.**, not `oexgxnybeixwadgtdtzp.supabase.co`.
3. Check logo, official email and displayed requested scopes; stop on unfamiliar or excessive Google permissions.
4. Consent, return to https://app.playbookseriesinc.org/auth/callback, verify session and exact chosen role. Do not assume default "scholar" for every returning account.
5. Sign out and sign back in. Check session restoration, error handling, and mobile layout. Confirm no unexpected new account, role reset or redirect loop.
6. Capture evidence: screenshot, Google project/client identity (never expose client secret), verification/published status, actual callback URL, and test outcome.

## Prerequisites / blockers
- No connected Google Cloud OAuth configuration action is currently available in this chat; cannot make or submit Google branding changes.
- OAuth project ownership, exact active web-client ID, existing privacy/terms URLs, official approved square logo and domain verification state must be checked in the console.
- Do not claim actual iPhone acceptance without opening and completing the Google OAuth flow in a controlled browser.
- Brand verification review is performed by Google, not the app code deployment.

References:
https://supabase.com/docs/guides/auth/social-login/auth-google
https://supabase.com/docs/guides/platform/custom-domains
https://developers.google.com/identity/verification/authentication-verification

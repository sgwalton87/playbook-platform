# Build Baseline

Generated: 2026-07-21

## Commands executed

All commands were executed from `/workspace/playbook-platform`.

## Results

| Command | Exit code | Status | Evidence summary |
| --- | ---: | --- | --- |
| `npm run lint` | 1 | NOT VERIFIED | ESLint failed. Output included `.playbook-backups/20260701_181912_types.ts` parse error, React hook errors, `no-explicit-any` errors, `no-html-link-for-pages` errors, and image optimization warnings. |
| `npx tsc --noEmit` | 0 | Verified | TypeScript completed with only npm warning `Unknown env config "http-proxy"`. |
| `npm run build` | 1 | NOT VERIFIED | Next.js 16.2.9 compiled successfully and finished TypeScript, then failed while collecting page data for `/api/notify-admin` because Resend was constructed without an API key. |
| `timeout 180 npm test -- --reporter=dot` | 0 | Verified | Vitest passed 88 test files and 291 tests in 146.68s. |

## Captured lint evidence

```text
/workspace/playbook-platform/.playbook-backups/20260701_181912_types.ts
  63:0  error  Parsing error: '}' expected

/workspace/playbook-platform/app/admin/moderation/page.tsx
  13:42  error  Unexpected any. Specify a different type
  27:5   error  Error: Calling setState synchronously within an effect can trigger cascading renders
```

The lint capture also reported additional errors in routes and library files. The captured command summary from the previous inspection showed `426 problems (324 errors, 102 warnings)`.

## Captured TypeScript evidence

```text
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.
```

Exit code was `0`.

## Captured build evidence

```text
▲ Next.js 16.2.9 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 19.2s
  Running TypeScript ...
  Finished TypeScript in 19.3s ...
  Collecting page data using 2 workers ...
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
```

The build then reported:

```text
Error: Failed to collect page data for /api/notify-admin
```

## Captured test evidence

```text
Test Files  88 passed (88)
Tests  291 passed (291)
Duration  146.68s
```

## Baseline conclusion

- TypeScript baseline: verified.
- Test baseline: verified.
- Build baseline: NOT VERIFIED.
- Lint baseline: NOT VERIFIED.
- Governance baseline: NOT VERIFIED because `docs/GOVERNANCE/GOVERNANCE_MANIFEST.md` was missing.


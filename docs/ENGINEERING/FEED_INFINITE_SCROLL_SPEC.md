# Feed Infinite Scroll Specification

Status: Phase 6 implementation specification

## Purpose

Close the canonical Feed `Infinite Scroll` capability by replacing fixed post and identity caps with deterministic, bounded pagination over `public.feed_posts`.

## Canonical ownership

- `public.feed_posts` remains the single canonical story source.
- Pagination must not create a feed cache table or duplicate story ownership.
- Existing Feed RLS remains authoritative for audience visibility.
- Anonymous callers may receive only rows allowed by the public Feed SELECT policy.
- Authenticated callers may receive public stories plus their own private stories according to existing RLS.

## Shared paging service

A single `public.get_feed_page(...)` function serves both public and authenticated Feed experiences.

The function must:

- execute as SECURITY INVOKER so table RLS remains authoritative;
- use a fixed search path;
- order by `created_at desc, id desc`;
- use the tuple `(created_at, id)` as the continuation cursor;
- return rows strictly older than the supplied cursor;
- accept a bounded page size from 1 through 50;
- default to 20 rows when no valid page size is supplied;
- grant execute only to `anon` and `authenticated`.

No service-role or SECURITY DEFINER visibility bypass is permitted for pagination.

## Identity hydration

Feed identity projection accepts at most 100 requested IDs per call.

Clients must therefore:

- de-duplicate author IDs;
- split IDs into batches of at most 100;
- resolve every batch;
- merge results without truncating later authors;
- apply the same batching to comment authors.

Hard `.slice(0, 100)` truncation is prohibited.

## Authenticated Feed experience

The signed-in Feed shall:

- fetch the first page on load;
- append later pages rather than replacing already loaded stories;
- de-duplicate posts by canonical post ID;
- expose a sentinel at the end of the rendered timeline;
- use `IntersectionObserver` to request the next page when the sentinel approaches the viewport;
- stop observing when the server returns fewer than the requested page size;
- preserve current category filtering over all pages already loaded;
- keep loading, success, empty, and error feedback visible.

Mutations such as Create, Edit, Delete, Like, Comment, and Share may refresh the loaded timeline from the first page after success; they must not weaken pagination authority.

## Public Feed experience

The public news feed shall consume the same paging function under the anonymous session and progressively append public stories.

The public experience must preserve:

- privacy-safe public identity fallback;
- current public media rendering;
- current join call-to-action;
- explicit loading/error/empty feedback.

## Performance and stability

- Page size: 20 rows.
- Maximum server page size: 50 rows.
- Cursor ordering must include UUID `id` as a deterministic tie-breaker for identical timestamps.
- No unbounded `select * from feed_posts` client query is permitted.
- No fixed total timeline cap is permitted.

## Observability

The UI must expose whether another page is loading and whether the end of the currently available timeline has been reached. Pagination failures must not discard pages already loaded.

## Definition of Done

Infinite Scroll is complete when both authenticated and public Feed experiences use the shared RLS-respecting cursor service, append deterministic pages without duplicates, stop at the true end of the timeline, resolve all author/comment identities through bounded batches, and pass CI, Database Certification, exact-head Vercel, production migration verification, and exact production deployment verification.

# ADR-0007 — Governed Portfolio Sharing and NIL Media Kits

**Status:** Accepted for implementation

## Decision

Playbook portfolio sharing is a governed projection of canonical Scholar-owned records, not a copied dossier and not an in-memory mock.

A portfolio share stores only:

- an opaque, high-entropy share identifier;
- the Scholar owner;
- the declared target use;
- an allowlisted packet describing which source-record sections the Scholar chose to expose;
- lifecycle state and optional expiry.

The public share resolver reads the current canonical source records at view time and returns only fields permitted by the packet. It must never expose fields merely because they exist in `profiles`, `athlete_profiles`, evidence tables, or another source system.

## NIL media kit

A NIL media kit is a `portfolio_shares` record with `target_use = 'nil'` and an allowlisted packet. It is a presentation/share configuration over existing canonical sources, not a second athlete profile.

Initial NIL shareable sections are:

- profile identity and bio;
- profile avatar and cover media;
- Scholar-selected social profile links already stored in the canonical profile;
- NIL brand interests;
- athlete sport, position, graduation year, and highlight film;
- profile media count as a truthful media-availability signal.

No deal amounts, contract records, disclosure status, tax information, private reflections, household information, academic records, eligibility evidence, verification evidence, contact email, or supporter relationships are exposed by this media-kit resolver.

## Security and lifecycle

- Share IDs must be random and non-derivable from Scholar IDs.
- Direct owner table access remains protected by RLS.
- Public/anonymous users do not receive direct `portfolio_shares` table access.
- Public resolution occurs only through a narrow function that requires an active, non-expired opaque share ID.
- Revoked, draft, or expired shares resolve to no data.
- Viewability is not a grant of Scholar Record access.
- The Scholar can revoke a share without deleting source records.

## Canonical ownership

- Profile/brand/social data: `profiles`
- Athlete identity and film: `athlete_profiles`
- Profile media: `album_media` / profile album services
- Share configuration/lifecycle: `portfolio_shares`

The share configuration never becomes the source of truth for profile, social, athletic, or media facts.

## Legacy correction

The existing `/portfolio/[shareId]` implementation constructs a deterministic in-memory share using placeholder Scholar data. That route must be replaced with the governed resolver. No hard-coded Scholar identity or deterministic `portfolio-${scholarId}` share IDs are permitted in production rendering.

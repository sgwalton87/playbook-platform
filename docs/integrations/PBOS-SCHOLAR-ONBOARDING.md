# Governed Scholar Onboarding Journey

## Purpose

This integration connects The Playbook's authenticated Scholar onboarding flow to PBOS v1 without allowing the application to self-authorize.

## Ownership and boundaries

- The Playbook owns the user interface, Supabase records, and Scholar experience.
- PBOS v1 owns connector identity, lifecycle communication, approved private exchange, and provenance.
- Connector credentials and approval references are server-only configuration.
- Merge, production deployment, secret creation, and certification remain protected human decisions.

## Runtime flow

1. Supabase authenticates the Scholar.
2. The server checks owner authority and requires the configured identity approval reference. Runtime-side verification of that approval is a production release gate.
3. The application durably records the Scholar profile, first goal, and onboarding milestone.
4. The server signs and publishes the onboarding lifecycle event to PBOS v1.
5. PBOS v1 processes the private identity-and-goals exchange. Production release requires independent verification of its scoped approval.
6. The application persists the projection and marks the dashboard ready.

Lifecycle and exchange retries use stable idempotency keys. Identity registration keeps its stable mapping and correlation IDs, and PBOS preserves the first accepted mapping. When activation configuration is missing or unsafe, the governed RPC saves the owner's profile and the app reports pending activation without granting PBOS authority.

## Required server configuration

Configure these seven settings on the application server only, following independent review of the production deployment scope. The deployment platform's protected environment stores the app-side material. Keep credential contents out of source, evidence, and browser configuration.

| Setting | Authoritative source | Verified production status |
| --- | --- | --- |
| `PBOS_API_URL` | The approved PBOS Cloud Run service URL with the exact `/pbos/v1` route. | No production endpoint confirmed. |
| `PBOS_ORGANIZATION_ID` | The certified PBOS organization manifest and the matching runtime environment. | `PLAYBOOK-ORG-001` is the canonical Playbook ID. Its staging binding is verified. |
| `PBOS_CONNECTOR_ID` | The certified connector registry entry for that organization. | `PLAYBOOK-CONNECTOR-001` is the canonical connector ID. Production registration and activation remain unverified. |
| `PBOS_CONNECTOR_KEY_ID` | The active credential record issued by PBOS `ConnectorCredentialAuthority` for that organization and connector. | No production issuance or deployment binding verified. |
| `PBOS_CONNECTOR_SECRET_BASE64` | The matching credential bytes from the approved production Secret Manager handoff, stored in the runtime trust bundle and app's protected environment. | Only staging resource references were verified. Secret values were not accessed. |
| `PBOS_SCHOLAR_IDENTITY_APPROVAL_ID` | An independent governance record authorizing Scholar identity activation for the production connector, organization, and owner boundary. | No production approval artifact or runtime verifier handoff verified. The app currently checks presence and ownership. |
| `PBOS_SCHOLAR_EXCHANGE_APPROVAL_ID` | An independent governance record for the production Scholar domain and private identity-and-goals projection. | Historical staging proof exists. No production approval or verifier handoff verified. |

### Infrastructure evidence and release gate

Read-only provider metadata on November 21, 2026 showed that all seven keys are set for Preview only on Vercel project `the-playbook` (`prj_mZ74XbviZKKplwVYPU3FLhFNka73`). Google Cloud listed no Cloud Run services or PBOS Secret Manager resources in the inspected application project `playbook-platform-500403`. The inspected PBOS integration service `pbos-v1-integration-staging` is ready in `pbos-genesis-staging`, with `pbos-connector-trust-bundle-staging` and `playbook-connector-bootstrap-staging` present. Those are staging resources. The canary image registry project supplies neither Playbook activation configuration nor PBOS connector authority.

PBOS Core source at `96d41042d821da10e6d4e3a40c94acefe53fff95` defines the runtime and credential trust boundary in `pbos/api/cloud-run-runtime.ts` and `pbos/integration/trust/credential-authority.ts`. `pbos/api/pbos-v1-api.ts` currently accepts identity registration from an active certified connector without receiving this Scholar identity approval ID. `pbos/integration/runtime/runtime-communication-boundary.ts` checks that an exchange reference and classification exist. That check does not establish that the reference is current, in scope or independently approved. Before enabling production activation, the approved runtime needs a verifiable source and enforcement path for both approvals. A nonempty identifier is insufficient evidence of a grant.

Promote only after independent approval of the exact production service, certified connector and active Scholar domain, credential scope, and both approval bindings. Exercise the signed journey with disposable identities and confirm the negative cases deny authority before production traffic is enabled. The existing [CIP-045 staging evidence](https://github.com/sgwalton87/PBOS-CORE/blob/96d41042d821da10e6d4e3a40c94acefe53fff95/docs/operations/CIP-045-PLAYBOOK-ACTIVATION.md) and [CIP-047 deployment runbook](https://github.com/sgwalton87/PBOS-CORE/blob/96d41042d821da10e6d4e3a40c94acefe53fff95/docs/operations/CIP-047-CLOUD-RUN-STAGING.md) document the established trust and deployment paths.

## Data and rollback

Migration `supabase/migrations/202608050003_pbos_scholar_dashboard.sql` adds idempotency boundaries and an owner-scoped dashboard projection. Rollback is a separately reviewed destructive migration; do not remove durable journey records automatically.

## Validation gate

Human operators run:

```bash
npm run typecheck
npm test
npm run build
```

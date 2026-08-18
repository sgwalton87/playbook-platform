# Phase 9 Academic Certification

## Purpose

Certify the Phase 9 Academic tracker against current implementation truth while preserving Playbook's constitutional rules: one platform, shared services first, single source of truth, human agency, privacy by design, security by default, and Scholar Record first.

## Canonical capability map

| Tracker capability | Canonical experience | Canonical authority |
| --- | --- | --- |
| Transcript Upload | `/transcript` | private transcript evidence + transcript submission workflow |
| Transcript Parsing | `/transcript` | `/api/parse-transcript` draft extraction |
| A-G Tracker | `/transcript` | `ag_progress` confirmed academic readiness data |
| FAFSA Tracker | `/fafsa` | `fafsa_tracker` |
| Scholarships | `/scholarships` | governed Opportunity catalog |
| College Search | `/college-search` | `colleges` reference catalog + learner-owned `college_list` |
| Dream Schools | `/dream-schools` | `college_list.is_dream` |
| Top Schools | `/top-schools` | `college_list.is_top` |
| Application Deadlines | `/application-workspaces` | `application_workspaces.deadline` |
| Application Tracker | `/application-workspaces` | Application Workspace status/tasks/documents |
| Academic Readiness | `/academic-readiness` | derived readiness from `ag_progress` + Application Workspaces, with recorded user decision |
| Compass Recommendations | `/compass` | derived, explainable guidance over canonical Playbook data |

## Non-duplication decisions

Transcript Upload, Transcript Parsing, and A-G Tracker are intentionally one academic-evidence journey. Parsed transcript data remains a draft until Scholar review and confirmation.

Application Deadlines and Application Tracker are intentionally fulfilled by Application Workspace. A second deadline or application-tracking datastore would violate shared-services-first and single-source ownership.

Dream Schools and Top Schools are independent priority flags on the same `college_list` record. They do not create duplicate school records and do not overwrite school provenance.

Scholarships use the shared Opportunity system rather than a second scholarship catalog.

Academic Readiness and Compass consume canonical data and produce derived guidance. They do not replace the Scholar Record or remove user decision authority.

## Release gate

Phase 9 is certifiable only when:

- exact-head dependency audit passes;
- lint passes without application-owned warnings;
- PBOS audit passes;
- all unit/regression tests pass;
- production TypeScript/build passes;
- Database Certification replays the migration chain from zero and all authority boundaries pass;
- the Phase 9 convergence test confirms all 12 tracker capabilities resolve to canonical implementation paths.

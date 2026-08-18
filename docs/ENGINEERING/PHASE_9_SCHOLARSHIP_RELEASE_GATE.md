# Scholarship Release Gate

Scholarships are green only when the dedicated Scholar route consumes the canonical published Marketplace catalog, filters `opportunity_type = scholarship`, preserves human-publication truth, and hands application work to the existing Application Workspace.

Required checks:

- No `scholarships` authority table is introduced.
- Empty catalog states remain truthful.
- Official external links are optional and clearly separate from Playbook application tracking.
- Application Workspace receives the canonical marketplace opportunity ID, scholarship title, scholarship type, and deadline when available.
- Regression, CI, build, and deployment gates pass before merge.

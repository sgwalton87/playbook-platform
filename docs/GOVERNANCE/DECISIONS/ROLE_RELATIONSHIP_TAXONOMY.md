# Role Relationship Taxonomy

## Decision

Support relationship identities must preserve the same role distinctions as public onboarding and Operating System routing.

A relationship identity may not collapse multiple canonical role selections into one ambiguous category.

## Exact identities

The shared relationship layer now recognizes distinct identities for:

- Parent / Guardian → `parent_guardian`
- Educator → `educator`
- High School Counselor → `counselor`
- Mentor → `mentor`
- High School Coach → `coach`
- District Administrator → `district_admin`
- College Coach / Recruiter → `college_recruiter`
- College Admissions → `college_admissions`
- Community Partner → `community_partner`
- Employer Partner → `employer_partner`

Scholar and Transition-Aged Youth self-owned support identity remains `scholar` where applicable.

## Legacy University identity

`university_partner` remains recognized only for backward compatibility with historical records. It is zero-permission and is not accepted for new invitation creation.

New university-related invitations must explicitly select either College Coach / Recruiter or College Admissions so the invitee lands in the correct OS and independent verification pathway.

## Permission boundary

Exact relationship identity does not grant cross-user data authority.

Counselor, Educator, Coach, District, Recruiting, Admissions, Community Partner, and Employer relationship identities begin with zero Scholar-data permissions and remain subordinate to their independent verification, scope, and relationship activation contracts.

## Routing

Each exact identity routes to its corresponding Operating System:

- Counselor → `/counselor-os`
- Coach → `/coach-os`
- Recruiting → `/recruiting-os`
- Admissions → `/admissions-os`
- Community Partner → `/community-partner-os`
- District → `/district-os`
- Employer → `/employer-os`

## PBOS rule

Future role additions must define an exact canonical relationship identity when relationship-based access is part of the role. Generic relationship aliases must not be used to bypass role selection, verification, or OS routing.

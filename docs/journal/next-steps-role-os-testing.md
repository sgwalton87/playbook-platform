# Next Steps — Role OS Testing

## Priority 1: End-to-end signup testing
Test each signup pathway:
- Scholar
- Scholar-Athlete
- Brand Partner
- Family
- Mentor
- Educator
- High School Coach
- College Coach / Recruiter
- College Admissions Officer
- Transition-Aged Youth
- Employer
- Other

Confirm:
- selected signup role is saved as `profile_mode`
- email confirmation routes to `/start?first=1&role=...`
- onboarding screens match the selected pathway
- final User Agreement appears
- profile creation animation appears
- completion redirects to the correct OS
- profile data persists to `profiles.onboarding_data`
- public profile reads saved data

## Priority 2: Sidebar by OS
Create role-aware sidebar menus so each user only sees what belongs to their OS.

Examples:
- Scholar: Dashboard, Transcript, Academic Readiness, Compass, Opportunities, Courses, Profile
- Scholar-Athlete: Scholar-Athlete OS, Transcript, Eligibility, Recruiting, NIL, Opportunities, Courses, Profile
- Brand Partner: Brand Partner OS, Campaigns, Rewards, NIL Education, Opportunities, Messages, Profile
- Family: Family OS, Linked Scholars, Messages, Financial Aid, Calendar, Profile
- Mentor: Mentor OS, Scholars, Requests, Recommendations, Messages, Profile
- Educator: Educator OS, Students, Letters, Academic Readiness, Messages, Profile
- Coach: Coach OS or Mentor OS, Roster, Recruiting Recommendations, Eligibility, Film, Messages
- College Coach: University OS, Talent Search, Recruiting Board, Messages, Compliance
- College Admissions: University OS, Academic Talent Search, Programs, Outreach, Messages
- Employer: Employer OS, Opportunities, Applicants, Internships, Messages

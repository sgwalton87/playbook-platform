# Scholar OS — Complete Product Specification

**Product**: Scholar OS  
**Version**: 1.0.0  
**Last Updated**: July 27, 2026  
**Status**: Codex-Ready Implementation Specifications  
**Target Users**: High school and college scholars

---

## Table of Contents

1. [Dashboard](#dashboard)
2. [Profile](#profile)
3. [Onboarding](#onboarding)
4. [Compass](#compass)
5. [Opportunities](#opportunities)
6. [Resume Intelligence](#resume-intelligence)
7. [Mentorship](#mentorship)
8. [Courses](#courses)
9. [Achievements](#achievements)
10. [Notifications](#notifications)

---

## DASHBOARD

### Purpose
Central hub for scholars to view their academic progress, pending actions, upcoming opportunities, and personalized recommendations. The dashboard aggregates key metrics and actionable items across all Scholar OS features.

### User
- Primary: Scholars (high school students, college students, recent graduates)
- Secondary: Parents (view-only access to selected sections)
- Context: Morning check-in, weekly review, planning sessions

### User Journey
```
Scholar logs in
    ↓
Dashboard loads with personalized snapshot
    ↓
Scholar can:
  • View GPA, credits completed, progress to graduation
  • See pending actions (course reviews, opportunity applications)
  • Browse recommended opportunities based on major/interests
  • Access quick links to other features
  • View recent achievements and badges
    ↓
Scholar navigates to specific feature or takes action
```

### Components

#### 1. Header Section
- Greeting with scholar name and current academic status
- Last login timestamp
- Quick settings/profile access
- Notification bell with unread count

#### 2. Progress Card
- GPA display (current semester, cumulative)
- Credits/courses completed (visual progress bar)
- Time to graduation (quarters/semesters)
- Degree progress percentage
- "View Full Progress" link to profile

#### 3. Pending Actions Widget
- Count badge (number of pending items)
- List of 3 most urgent actions:
  - Incomplete course reviews
  - Pending opportunity applications
  - Mentorship requests awaiting response
  - Missing profile information
- "View All Actions" link

#### 4. Opportunities Spotlight
- 2-3 featured opportunities matched to scholar profile
- Opportunity type badge (scholarship, internship, mentorship, etc.)
- Application deadline countdown
- "Apply Now" or "View Details" button

#### 5. Recent Achievements
- Grid of 4-6 recent badges/achievements
- Achievement name and award date
- "View All Achievements" link

#### 6. Recommended Courses
- 2-3 courses recommended based on major/interests
- Course name, credit hours, term
- "View More Courses" link

#### 7. Mentorship Connections
- Quick view of current mentors (1-2)
- Status of mentorship relationship (active, scheduled, new)
- "Message Mentor" / "Schedule Session" buttons
- "Find More Mentors" link

### Data Source
- Scholar profile (personal info, academic status)
- Course enrollment (current courses, grades)
- Opportunity matches (based on profile, filters)
- Achievement/badge system
- Mentorship relationships
- Action queue (pending tasks)

### Database Fields

```typescript
interface DashboardData {
  // Scholar Info
  scholarId: string;
  name: string;
  profilePhotoUrl?: string;
  
  // Academic Progress
  currentGPA: number;
  cumulativeGPA: number;
  creditsCompleted: number;
  creditsRequired: number;
  graduationDate: Date;
  degreeProgress: number; // percentage
  
  // Pending Actions
  pendingActions: Action[];
  
  // Opportunities
  recommendedOpportunities: Opportunity[];
  
  // Achievements
  recentAchievements: Achievement[];
  
  // Courses
  recommendedCourses: Course[];
  
  // Mentorship
  activeMentorships: Mentorship[];
  
  // Last Updated
  lastUpdated: Date;
}
```

### Permissions
- Scholar: Full access to own dashboard
- Parents: View-only to dashboard (if permissions granted)
- Advisors: View scholar dashboard when explicitly shared
- Admin: Can view any scholar dashboard

### Loading State
```
- Skeleton loaders for all sections
- Placeholder cards with animated loading pulse
- "Dashboard loading..." message
- Estimated load time: <2 seconds
```

### Empty State
```
- No pending actions: "All caught up! 🎉 Check out new opportunities below"
- No recommended opportunities: "No new opportunities right now. Update your profile to get personalized recommendations"
- No achievements: "Earn your first achievement! Complete a course review or find a mentor"
- No active mentorships: "You don't have a mentor yet. Find one in Mentorship section"
```

### Error State
```
- Connection error: "Unable to load dashboard. Please check your connection and refresh."
- Data loading failure: "We encountered an issue loading your dashboard. Try refreshing."
- Partial failure: Show successfully loaded sections, indicate which sections failed
```

### Success State
- Dashboard fully loaded with all sections populated
- Data refreshed within last 5 minutes
- All interactive elements responsive

### Mobile Behavior
- Stack sections vertically
- Full-width cards
- Reduced header, compact logo
- Simplified pending actions (show 2 items instead of 3)
- Simplified opportunities (show 1 featured instead of 2-3)
- Bottom tab navigation for feature access
- Swipeable cards for achievements/mentors

### Accessibility
- Semantic HTML (main, section, article tags)
- ARIA labels for all interactive elements
- Screen reader support for metrics ("GPA: 3.8 out of 4")
- Keyboard navigation (Tab through all sections)
- Color not the only indicator (use icons + text for status)
- Sufficient color contrast (WCAG AA minimum)
- Focus indicators on all buttons
- Skip links to main sections

### Definition of Done
- [ ] Dashboard loads within 2 seconds
- [ ] All sections display correct data
- [ ] Pending actions accurate and current
- [ ] Opportunity recommendations relevant to profile
- [ ] Load state shows while fetching data
- [ ] Empty states display with helpful messages
- [ ] Error handling for failed data loads
- [ ] Mobile layout tested on iPhone and Android
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Unit tests for data transformations
- [ ] Integration tests for API calls
- [ ] E2E test for complete user flow
- [ ] Performance monitored (<2s load time)

---

## PROFILE

### Purpose
Scholars manage and present their academic, professional, and personal information. Profile serves as a personal portfolio, privacy-controlled information repository, and foundation for personalized recommendations across Scholar OS.

### User
- Primary: Scholar (editing own profile)
- Secondary: Other scholars (viewing public profile information)
- Tertiary: Mentors, recruiters, advisors (viewing shared information)
- Context: Setup during onboarding, ongoing updates, before applying to opportunities

### User Journey
```
Scholar accesses Profile section
    ↓
Scholar sees profile summary and can choose to:
  • View public profile preview
  • Edit personal information
  • Update academic information
  • Add skills and interests
  • Upload/update profile photo
  • Manage visibility/privacy settings
    ↓
Scholar makes edits
    ↓
Changes saved (auto-save or explicit save)
    ↓
Scholar receives confirmation
```

### Components

#### 1. Profile Header
- Profile photo (editable)
- Scholar name (editable)
- Major/concentration
- Class year
- Status badge (current student, alumni, etc.)

#### 2. Personal Information Section
- Legal name
- Email address(es)
- Phone number
- Date of birth (visibility toggle)
- Preferred pronouns
- Location/Home town
- Bio/About me (text area)

#### 3. Academic Information Section
- School/University
- Major(s)
- Minor(s)
- GPA (current, cumulative)
- Graduation date
- Scholarship status
- Academic honors

#### 4. Skills & Interests
- Technical skills (tags: Python, React, etc.)
- Soft skills (tags: Leadership, Communication, etc.)
- Interests (tags: Sustainability, Healthcare, etc.)
- Languages spoken
- Certifications

#### 5. Experience Section
- Work experience entries (role, company, duration, description)
- Internship experience
- Volunteer experience
- Leadership roles
- Projects/portfolio items

#### 6. Education Details
- Relevant coursework
- Clubs/organizations
- Awards and honors
- Test scores (SAT, ACT, GRE, etc.) - optional visibility

#### 7. Privacy & Visibility Settings
- Public profile toggle
- Who can view email, phone, birthdate
- Who can message scholar
- Show profile in search results
- Allow recommendations based on profile

#### 8. Connected Accounts (Optional)
- LinkedIn profile link
- GitHub/portfolio links
- Personal website/blog
- Social media profiles

### Data Source
- Scholar database (personal info)
- Academic records system (GPA, graduation date)
- Experience/portfolio entries
- Skill tags library
- Media storage (profile photos)

### Database Fields

```typescript
interface ScholarProfile {
  // Core Identity
  scholarId: string;
  legalName: string;
  displayName: string;
  email: string;
  phone?: string;
  profilePhotoUrl?: string;
  
  // Academic Info
  schoolId: string;
  majorId: string;
  minorIds?: string[];
  currentGPA: number;
  cumulativeGPA: number;
  graduationDate: Date;
  classYear: string; // e.g., "Class of 2027"
  scholarshipStatus: string;
  
  // Personal Details
  dateOfBirth?: Date;
  pronouns: string;
  location: string;
  bio: string;
  
  // Skills & Interests
  technicalSkills: Skill[];
  softSkills: Skill[];
  interests: Interest[];
  languages: Language[];
  certifications: Certification[];
  
  // Experience
  experiences: Experience[];
  projects: Project[];
  
  // Privacy Settings
  isPublic: boolean;
  privacySettings: PrivacySettings;
  
  // Connected Accounts
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  
  // Metadata
  profileCompleteness: number; // 0-100%
  createdAt: Date;
  updatedAt: Date;
}

interface PrivacySettings {
  emailVisible: 'public' | 'mentors_only' | 'private';
  phoneVisible: 'public' | 'mentors_only' | 'private';
  birthdateVisible: boolean;
  allowMessaging: boolean;
  allowRecommendations: boolean;
  showInSearch: boolean;
}
```

### Permissions
- Scholar: Full edit access to own profile
- Mentors: View profile (name, academic info, interests)
- Recruiters: View name, major, experience, skills (with scholar consent)
- Parents: View academic progress, edit own contact info (if linked)
- Admin: View all profiles, edit for support purposes

### Loading State
```
- Skeleton loaders for each section
- Animated pulse on profile photo placeholder
- "Loading your profile..." message
- Save button disabled during load
```

### Empty State
```
- Empty sections have placeholder text with add buttons
- "No experience yet. Add your first experience."
- "No skills added. Add skills that describe you."
- "Complete your profile to unlock personalized recommendations (X% complete)"
```

### Error State
```
- Profile save failed: "Unable to save changes. Please try again."
- Photo upload failed: "Failed to upload photo. Maximum size is 5MB."
- Partial errors: "Some changes saved, but we had trouble with [field]"
```

### Success State
- Profile section fully loaded with all fields populated
- Confirmation message after saving changes ("Profile updated")
- Profile completeness percentage updated
- Profile photo successfully loaded and displays

### Mobile Behavior
- Single column layout
- Full-width input fields
- Modal dialogs for complex editing (experience, skills)
- Horizontal scroll for skill/interest tags
- Touch-friendly photo upload (camera icon at bottom)
- Swipeable between profile sections
- Sticky header with name and navigation

### Accessibility
- Label all form inputs
- Semantic form structure
- ARIA descriptions for complex sections
- Focus management when modals open/close
- Screen reader support for profile completeness percentage
- High contrast for privacy setting toggles
- Keyboard navigation through all fields
- Auto-focus first empty field in edit mode

### Definition of Done
- [ ] All profile fields display correctly
- [ ] Edit mode allows changes to all fields
- [ ] Changes persist in database
- [ ] Profile photo uploads and displays
- [ ] Privacy settings respected (fields hidden/shown correctly)
- [ ] Profile completeness percentage accurate
- [ ] Mobile layout tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Auto-save works (if implemented)
- [ ] Confirmation messages display
- [ ] Error handling for failed saves
- [ ] Unit tests for profile data transformations
- [ ] E2E test for complete profile edit

---

## ONBOARDING

### Purpose
Guide new scholars through setup process to create initial profile, understand Scholar OS features, and enter the platform ready to engage. Onboarding establishes critical information for personalization while keeping friction low.

### User
- Primary: New scholars (first-time users)
- Secondary: Scholars re-enrolling or transferring
- Context: Immediate after account creation, max 15 minutes

### User Journey
```
New scholar receives signup link / creates account
    ↓
Onboarding flow launches automatically
    ↓
Step 1: Welcome & Overview
    ↓
Step 2: Personal Information (Name, Email, Photo)
    ↓
Step 3: Academic Information (School, Major, GPA, Grad Date)
    ↓
Step 4: Goals & Interests (Skills, Interests, What scholar hopes to do)
    ↓
Step 5: Feature Overview (Quick tour of key features)
    ↓
Step 6: Mentorship Preferences (Open to mentorship? Areas of interest?)
    ↓
Scholar completes onboarding
    ↓
Scholar lands on Dashboard or Feature Tour
```

### Components

#### 1. Welcome Screen
- Product name and tagline
- Brief value proposition (2-3 sentences)
- "Get Started" button
- Option to skip to dashboard (for returning users)

#### 2. Personal Information Form
- Full name (required)
- Email address (required, pre-filled if from signup)
- Phone number (optional)
- Profile photo upload (optional but encouraged)
- Pronouns (dropdown, optional)
- "Next" button

#### 3. Academic Information Form
- School/University selection (dropdown)
- Major(s) selection (multi-select dropdown)
- Minor(s) selection (optional, multi-select)
- GPA (optional but encouraged)
- Graduation date (required, date picker)
- "Next" button

#### 4. Goals & Interests Form
- "What are your academic goals?" (text area)
- Select top interests (multi-select: healthcare, tech, business, etc.)
- Select skills (multi-select tags: Python, Leadership, Writing, etc.)
- "What career path interests you?" (optional text)
- "Next" button

#### 5. Feature Overview Cards
- Dashboard: "Track your progress and stay on top of actions"
- Compass: "Discover your path with personalized guidance"
- Opportunities: "Find scholarships, internships, and experiences"
- Mentorship: "Connect with mentors in your field"
- Courses: "Explore and enroll in relevant courses"
- (Show 5-6 key features with icons and brief descriptions)
- "Continue" button

#### 6. Mentorship Preferences
- "Are you interested in finding a mentor?" (yes/no toggle)
- If yes: "What areas would you like mentorship in?" (multi-select)
- "How often do you want to meet with a mentor?" (dropdown: weekly, biweekly, monthly)
- "Next" button

#### 7. Completion Screen
- "You're all set! 🎉"
- Summary of profile created
- Recommendations for next steps
- "Go to Dashboard" button
- "Take a Feature Tour" button (alternative)

### Data Source
- Scholar input during onboarding
- Skills/interests library (dropdown options)
- School/university database
- Major database

### Database Fields

```typescript
interface OnboardingData {
  scholarId: string;
  
  // Personal Information
  fullName: string;
  email: string;
  phone?: string;
  pronouns?: string;
  profilePhotoUrl?: string;
  
  // Academic Information
  schoolId: string;
  majorIds: string[];
  minorIds?: string[];
  gpa?: number;
  graduationDate: Date;
  
  // Goals & Interests
  academicGoals: string;
  interests: string[]; // Interest IDs
  skills: string[]; // Skill IDs
  careerPath?: string;
  
  // Mentorship
  interestedInMentorship: boolean;
  mentorshipInterests?: string[];
  preferredMeetingFrequency?: string;
  
  // Metadata
  onboardingCompleted: boolean;
  completedAt?: Date;
  completionPercentage: number;
}
```

### Permissions
- Scholar: Can only complete own onboarding
- Admin: Can view onboarding completion rates
- System: Auto-create profile data from onboarding

### Loading State
```
- Form validation spinner on submit
- "Saving your information..." message
- Progress indicator showing current step (e.g., "Step 2 of 6")
- Disabled Next button during save
```

### Empty State
```
- Initial state shows Step 1 (Welcome)
- Empty form fields with placeholder text
- Help text under each field
```

### Error State
```
- Required field missing: "Please enter your [field name]"
- Invalid email: "Please enter a valid email address"
- Photo upload failed: "We couldn't upload your photo. Try again or skip."
- Step save failed: "Unable to save. Please try again."
```

### Success State
- Each step completes and shows confirmation
- Progress indicator advances
- User able to proceed to next step
- Final completion screen shows summary
- Profile created and accessible from dashboard

### Mobile Behavior
- Full screen form per step
- One question/section per screen (mobile-optimized)
- Large touch targets for buttons
- Simple back button to previous step
- Progress bar at top showing steps completed
- Bottom buttons for Next/Back actions
- Camera access for photo upload on mobile

### Accessibility
- Semantic form structure
- ARIA labels on all inputs
- Error messages linked to fields with aria-describedby
- Keyboard navigation through all steps
- Screen reader announces progress ("Step 2 of 6")
- Focus management when moving between steps
- Color not only indicator for errors (use icons too)
- Clear button labels ("Next" not just "→")

### Definition of Done
- [ ] All 6 onboarding steps functional
- [ ] Form validation works correctly
- [ ] Data saves to database correctly
- [ ] Profile created after completion
- [ ] User can navigate back/forward through steps
- [ ] Photo upload works (PNG, JPG, GIF)
- [ ] Dropdown options load correctly
- [ ] Error messages display appropriately
- [ ] Mobile layout tested end-to-end
- [ ] Accessibility audit passed
- [ ] No console errors during flow
- [ ] Onboarding can be skipped (for returning users)
- [ ] Completion email sent on finish
- [ ] Unit tests for form validation
- [ ] E2E test for complete onboarding flow

---

## COMPASS

### Purpose
Personalized navigation and guidance system that helps scholars understand their academic path, explore career options, identify relevant opportunities, and make informed decisions about their education and career.

### User
- Primary: Scholars seeking direction or guidance
- Secondary: Advisors (can view scholar's compass path)
- Context: During major selection, career exploration, planning sessions

### User Journey
```
Scholar navigates to Compass
    ↓
Scholar sees current path/plan visualization
    ↓
Scholar can:
  • View recommended paths based on major
  • Explore career options related to major
  • See skills needed for different paths
  • Get recommended courses/opportunities
  • Take career assessments
    ↓
Scholar adjusts interests/goals
    ↓
Compass recommendations update
    ↓
Scholar can export path or share with advisor
```

### Components

#### 1. Compass Header
- Title: "Your Academic & Career Path"
- Current major/interests
- Last updated date
- "Take Assessment" button for updates

#### 2. Current Path Visualization
- Visual timeline/map of:
  - Current major
  - Related career paths
  - Time to graduation
  - Key milestones ahead
- Interactive nodes showing different paths

#### 3. Career Options Cards
- 3-5 career paths related to scholar's major
- For each: Job title, industry, median salary, job market outlook
- "Learn More" button for each
- "Explore Similar" link

#### 4. Skills Roadmap
- Skills needed for current path vs. related paths
- Proficiency levels (beginner, intermediate, advanced)
- Recommended skills to develop
- Courses that teach these skills
- "Add to My Goals" button

#### 5. Course Recommendations
- Recommended courses by term/semester
- Prerequisite visualization
- "Enroll" button for available courses
- Alternative course options

#### 6. Opportunity Recommendations
- Internships/co-ops aligned with path
- Scholarships and funding
- Conferences/workshops
- Study abroad opportunities
- Volunteer positions
- "Apply" or "Learn More" buttons

#### 7. Advisor Connection
- "Share with Your Advisor" button
- Message field for context
- Option to schedule advising appointment

#### 8. Path Export
- Download path as PDF or image
- Share link (shareable URL)
- Print-friendly format

### Data Source
- Scholar major and interests
- Career database (job titles, industries, salaries)
- Skills library and job requirement mapping
- Course catalog with career alignment
- Opportunity database filtered by major/skills
- Career assessment tools/APIs

### Database Fields

```typescript
interface CompassPath {
  scholarId: string;
  
  // Current Path
  major: string;
  interests: string[];
  careerGoals?: string[];
  
  // Career Options
  recommendedCareers: Career[];
  
  // Skills Roadmap
  currentSkills: Skill[];
  recommendedSkills: Skill[];
  skillDevelopmentPlan: SkillDevelopment[];
  
  // Course Plan
  recommendedCourses: Course[];
  currentCourses: Course[];
  futureSemesters: {
    term: string;
    courses: Course[];
  }[];
  
  // Opportunities
  alignedOpportunities: Opportunity[];
  
  // Assessment
  careerAssessmentResult?: CareerAssessment;
  lastAssessmentDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  conversationHistory: Interaction[];
}

interface Career {
  id: string;
  title: string;
  industry: string;
  description: string;
  medianSalary: number;
  jobGrowthOutlook: string; // "growing", "stable", "declining"
  requiredSkills: string[];
  typicalPath: string; // e.g., "4-year degree + internship"
}
```

### Permissions
- Scholar: Full access to own compass path
- Advisor: View-only access to shared paths
- Admin: Can view compass analytics
- Parent: View-only if explicitly shared

### Loading State
```
- Skeleton loaders for career cards, course recommendations
- Animated loading pulse on visualizations
- "Generating your path..." message
- Progress indicator for assessment results
```

### Empty State
```
- No career assessment taken: "Complete a career assessment to get personalized recommendations"
- No recommended courses: "No courses match your path yet. Update your interests."
- No opportunities: "New opportunities will appear as you progress. Check back soon!"
```

### Error State
```
- Assessment failed: "We couldn't complete the career assessment. Please try again."
- No paths available: "We don't have paths for your major yet. Contact your advisor."
- Share failed: "Unable to share with advisor. Please try again."
```

### Success State
- Path fully loaded and displayed
- Career options populated
- Skills roadmap visible
- Course recommendations generated
- Export functionality available
- Sharing successful

### Mobile Behavior
- Vertical scroll through path visualization
- Cards show one per row
- Swipeable between career options
- Simplified visualization (focus on next semester)
- Modal for detailed career information
- Bottom sheet for sharing options
- Collapsed course roadmap with expand/collapse

### Accessibility
- Semantic HTML structure
- ARIA labels on visualization nodes
- Text descriptions for visual diagrams
- Keyboard navigation through career cards
- Screen reader support for career data ("Software Engineer: $120k median salary, high growth")
- Skip links to main sections
- Color not only indicator (use text labels too)
- High contrast for important data

### Definition of Done
- [ ] Compass path displays correctly
- [ ] Career recommendations relevant to major
- [ ] Skills roadmap accurate
- [ ] Course recommendations valid
- [ ] Opportunity recommendations filtered correctly
- [ ] Assessment integration works
- [ ] Export to PDF functional
- [ ] Share with advisor works
- [ ] Mobile layout tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Performance: loads in <3 seconds
- [ ] Unit tests for path generation logic
- [ ] E2E test for complete compass flow

---

## OPPORTUNITIES

### Purpose
Centralized discovery and application platform for scholarships, internships, study abroad programs, research opportunities, conferences, and other experiences aligned with scholar's goals and academic profile.

### User
- Primary: Scholars browsing and applying to opportunities
- Secondary: Opportunity partners (posting opportunities)
- Context: Ongoing (weekly browse), application season intensive use

### User Journey
```
Scholar navigates to Opportunities
    ↓
Scholar sees feed of opportunities
    ↓
Scholar can:
  • Browse all opportunities or filter by type/deadline
  • Search opportunities by keyword
  • View detailed opportunity information
  • Apply to opportunity
  • Save opportunity to list
  • Track application status
  • Receive recommendations
    ↓
Scholar clicks on opportunity
    ↓
Opportunity details page loads
    ↓
Scholar reviews requirements and applies
    ↓
Application submitted
    ↓
Scholar receives confirmation and tracking updates
```

### Components

#### 1. Header & Search
- Search bar with filters (keyword search)
- Filter buttons: Type, Deadline, Funding Amount, Location
- "New Opportunities" badge showing count
- Saved/Bookmarked opportunities shortcut

#### 2. Opportunities Feed
- List of opportunities as cards showing:
  - Opportunity title and organization
  - Opportunity type badge (scholarship, internship, etc.)
  - Application deadline countdown
  - Funding amount (if applicable)
  - Key requirements summary
  - "Apply" or "View Details" button
  - Bookmark/save icon

#### 3. Filters Sidebar
- Opportunity Type (multi-select): Scholarship, Internship, Mentorship, Study Abroad, Conference, Research, etc.
- Funding Amount range slider
- Deadline filter: This month, Next 3 months, Next 6 months, No deadline
- Location: On-campus, Off-campus, Remote, Specific region
- Major alignment: Show only aligned with my major
- Difficulty level: First-year friendly, Any experience

#### 4. Opportunity Detail Page
- Opportunity name and organization
- Application deadline (prominent)
- Funding amount and funding type
- Program description
- Eligibility requirements
- Required documents (essay, resume, transcript, etc.)
- Selection criteria
- Start date and duration
- Application button ("Apply Now" or "Application Closed")
- "Ask Mentor" button for questions
- "Share with Friend" button
- Similar opportunities carousel

#### 5. Application Form
- Dynamic form based on opportunity requirements
- Auto-filled fields (name, email, GPA, etc. where applicable)
- Essay question text areas with character count
- File upload fields (resume, transcript, essay)
- Confirmation of eligibility (checkbox)
- Terms of participation (checkbox)
- Submit button with preview option

#### 6. Application Tracking
- List of submitted applications
- Status for each: Applied, Under Review, Shortlisted, Rejected, Accepted
- Timeline showing key dates (application date, deadline, decision expected)
- Status history for each application
- Ability to withdraw application (before review starts)

#### 7. Recommendations Widget
- "Opportunities for You" section
- 3-5 recommended opportunities based on profile
- Relevance score or explanation ("Matches your major and GPA")
- "See More" link

### Data Source
- Opportunity database (all opportunities available)
- Scholar profile (for filtering and recommendations)
- Scholar applications database
- Organization/partner database
- Skills and major alignment data

### Database Fields

```typescript
interface Opportunity {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  type: 'scholarship' | 'internship' | 'mentorship' | 'study_abroad' | 'conference' | 'research' | 'volunteer';
  
  // Opportunity Details
  funding: {
    amount?: number;
    type: 'full_ride' | 'partial' | 'hourly' | 'stipend' | 'expense_covered' | 'unpaid';
    currency: string;
  };
  
  location: {
    type: 'on_campus' | 'off_campus' | 'remote';
    city?: string;
    state?: string;
    country?: string;
  };
  
  duration: {
    startDate: Date;
    endDate?: Date;
    length: string; // "8 weeks", "1 year", etc.
  };
  
  // Application Info
  applicationDeadline: Date;
  applicationStatus: 'open' | 'closed' | 'coming_soon';
  applicationUrl?: string; // If external
  
  // Requirements & Eligibility
  eligibility: {
    minGPA?: number;
    majorRequirements?: string[];
    yearRequirements?: string[];
    citizenshipRequirements?: string[];
    customRequirements?: string[];
  };
  
  requiredDocuments: {
    name: string;
    type: 'essay' | 'resume' | 'transcript' | 'recommendation' | 'portfolio' | 'other';
    required: boolean;
    description?: string;
  }[];
  
  selectionCriteria: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  applicationCount: number;
  alignedMajors: string[];
  difficulty: 'easy' | 'moderate' | 'competitive';
}

interface ScholarApplication {
  id: string;
  scholarId: string;
  opportunityId: string;
  
  status: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'accepted';
  
  applicationData: {
    [fieldName: string]: string | File; // Dynamic based on opportunity requirements
  };
  
  submittedAt?: Date;
  decidedAt?: Date;
  decision?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Permissions
- Scholar: Can view all opportunities, apply to eligible ones, view own applications
- Partner: Can view and manage own opportunities
- Admin: Can view all opportunities and applications
- Mentor: Can view scholar's applications if explicitly shared

### Loading State
```
- Skeleton loaders for opportunity cards (while feed loads)
- Animated loading pulse
- Filter options disabled while loading
- "Loading opportunities..." message if >1 second
```

### Empty State
```
- No opportunities matching filters: "No opportunities match your filters. Try adjusting your selections."
- No opportunities yet: "New opportunities will appear soon. Check back later!"
- No applications: "Start exploring opportunities and apply!"
```

### Error State
```
- Application submission failed: "We couldn't submit your application. Please try again."
- Failed to load opportunities: "Unable to load opportunities. Please refresh."
- File upload failed: "Failed to upload [filename]. Try a different file."
```

### Success State
- Opportunities feed loads with items
- Application submitted successfully
- Confirmation message: "Your application has been submitted!"
- Application appears in tracking list
- Status updates received

### Mobile Behavior
- Vertical feed of opportunity cards
- Full-width cards with compact information
- Filters accessible via drawer/modal
- Application form optimized for mobile: one field per screen or simple vertical stack
- Large buttons for Apply/Save actions
- Swipeable tabs between filter categories
- Deadline countdown prominent
- Application status tracking card view

### Accessibility
- Semantic list structure for opportunities
- ARIA labels for deadline countdowns
- Form labels clearly associated with inputs
- Error messages linked to form fields
- Keyboard navigation through opportunity feed
- Focus management in application form
- Screen reader support for opportunity types and deadlines
- Skip links to opportunities feed and filters
- Color not only indicator (use icons for deadline urgency)

### Definition of Done
- [ ] Opportunities feed loads and displays correctly
- [ ] Filters work accurately
- [ ] Search functionality operational
- [ ] Application form displays correct fields
- [ ] Application submission successful
- [ ] Confirmation email sent
- [ ] Application tracking works
- [ ] Status updates reflected in real-time
- [ ] Recommendations generated accurately
- [ ] Mobile layout fully tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Performance: feed loads in <2 seconds
- [ ] Unit tests for recommendation algorithm
- [ ] E2E test for complete application flow

---

## RESUME INTELLIGENCE

### Purpose
AI-powered resume analysis, optimization, and builder that helps scholars craft compelling resumes, receive feedback on content and formatting, and ensure their resume effectively showcases their academic achievements and experiences.

### User
- Primary: Scholars building or refining their resume
- Secondary: Mentors (reviewing scholar resumes)
- Context: Before job search, before applying to opportunities, mentor review sessions

### User Journey
```
Scholar navigates to Resume Intelligence
    ↓
Scholar sees their current resume (if exists) or starts building new one
    ↓
Scholar can:
  • Build resume from scratch or import existing
  • Add experiences, education, skills
  • Choose from resume templates
  • Get AI feedback on content
  • Optimize for keywords
  • Download/export resume
  • Share with mentor for review
    ↓
Scholar uses AI feedback to improve resume
    ↓
Scholar downloads polished resume
```

### Components

#### 1. Resume Templates
- Gallery of 3-5 professional resume templates
- Template preview
- "Use This Template" button
- Customizable template options (colors, fonts)

#### 2. Resume Builder
- Drag-and-drop sections
- Pre-populated sections:
  - Contact Information
  - Professional Summary
  - Experience
  - Education
  - Skills
  - Achievements/Certifications
  - Projects
  - Volunteer Experience
- Add/remove sections button

#### 3. Each Section Editor
- For each section type, provide input fields:
  - **Education**: School, major, GPA, graduation date, coursework, honors
  - **Experience**: Job title, company, duration, description, achievements
  - **Skills**: Skill tags with proficiency levels
  - **Achievements**: Award name, date, description
- Rich text editor for descriptions (bold, italic, bullet points)
- Save button for each section
- Preview of formatting in real-time

#### 4. AI Analysis Panel
- Real-time feedback as scholar builds resume:
  - "Strong action verbs detected!" 
  - "Consider adding more quantifiable results"
  - "Keywords aligned with [target job title]"
  - "Length feedback: Good length for entry-level position"
- Improvement suggestions:
  - "Add 2-3 more accomplishments to Experience section"
  - "Consider highlighting [skill] more prominently"
  - "This role matches [Opportunity ID] - want to apply?"
- AI score (0-100) for resume strength

#### 5. Keyword Optimization
- Suggest keywords based on target role/major
- Show keyword coverage in current resume
- Allow scholar to add suggested keywords
- Show where keywords appear in resume
- "Optimize for [job title]" button

#### 6. Format & Design
- Font selection (Calibri, Arial, Times New Roman, etc.)
- Color scheme customization
- Section layout options
- Spacing adjustments
- Preview pane showing formatted resume

#### 7. Download & Export
- Download as PDF button
- Download as DOCX button
- Download as plain text button
- Copy formatted text button

#### 8. Share & Review
- Generate shareable link
- Share with mentor button
- "Request Review from Mentor" action
- Mentor feedback section (if review requested)

### Data Source
- Scholar profile information (auto-populate)
- Experience entries from profile
- Skills and certifications from profile
- AI language model for content feedback
- Job/opportunity database for keyword alignment
- Template library
- Mentor database (for sharing)

### Database Fields

```typescript
interface Resume {
  id: string;
  scholarId: string;
  title: string; // "Resume - [Scholar Name]" or custom
  
  // Content Sections
  contactInformation: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  
  professionalSummary: string;
  
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  achievements: ResumeAchievement[];
  projects: ResumeProject[];
  volunteering: ResumeVolunteer[];
  
  // Design & Format
  template: string; // Template ID
  formatting: {
    font: string;
    colorScheme: string;
    layout: string;
  };
  
  // AI Analysis
  aiAnalysisScore: number;
  aiSuggestions: string[];
  keywordOptimization: {
    suggestedKeywords: string[];
    coveredKeywords: string[];
    missingKeywords: string[];
  };
  
  // Sharing & Collaboration
  isPublic: boolean;
  shareUrl?: string;
  sharedWithMentors: string[]; // Mentor IDs
  mentorFeedback?: MentorFeedback[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface ResumeExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: Date;
  endDate?: Date; // null if current
  location: string;
  description: string;
  accomplishments: string[]; // Bullet points
  skills: string[];
  isCurrentPosition: boolean;
}

interface MentorFeedback {
  id: string;
  mentorId: string;
  comment: string;
  section: string;
  severity: 'suggestion' | 'improvement' | 'critical';
  createdAt: Date;
}
```

### Permissions
- Scholar: Full access to own resume, can request mentor review
- Mentor: View resume if shared, add feedback
- Admin: View all resumes (anonymized for analytics)
- Partner: Can view resume if scholar applying to opportunity

### Loading State
```
- Skeleton loaders for resume sections
- Template gallery loading animation
- "Analyzing your resume..." while AI generates feedback
- Save indicator ("Saving..." → "Saved")
```

### Empty State
```
- No resume: "Start building your resume! Choose a template or create a blank resume"
- No experiences: "Add your work and volunteer experience to your resume"
- No AI feedback yet: "We're analyzing your resume. Feedback coming shortly..."
```

### Error State
```
- Unsupported file format: "We support PDF and DOCX files only"
- Save failed: "Unable to save resume. Please try again."
- AI analysis error: "We couldn't analyze your resume. Try again later."
- Download failed: "Failed to generate PDF. Please try again."
```

### Success State
- Resume loads with all sections populated
- AI analysis completes with suggestions
- Sections save successfully
- Resume preview displays formatted correctly
- Download completes
- Sharing link generated
- Mentor review submitted

### Mobile Behavior
- Vertical layout for resume building
- Modal or bottom sheet for section editing
- Preview toggleable full screen
- Download options in mobile-friendly format
- Simplified template gallery (scroll horizontally)
- One field per row for better mobile UX
- Collapsible sections to reduce scrolling
- Larger touch targets for add/delete actions

### Accessibility
- Semantic form structure
- ARIA labels on all inputs
- Rich text editor keyboard accessible
- Screen reader support for AI feedback
- Focus management when opening section editors
- Color not only indicator for AI feedback severity
- Keyboard navigation through sections
- Skip links to main resume content
- Labels for all form inputs

### Definition of Done
- [ ] Resume template gallery displays
- [ ] Resume builder loads and saves correctly
- [ ] All sections editable with proper formatting
- [ ] AI analysis generates relevant feedback
- [ ] Keyword optimization works
- [ ] Download functionality (PDF, DOCX) works
- [ ] Sharing with mentors works
- [ ] Mentor feedback displays
- [ ] Mobile layout tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Performance: AI analysis <5 seconds
- [ ] Unit tests for content validation
- [ ] E2E test for complete resume build flow

---

## MENTORSHIP

### Purpose
Connection and relationship management platform that matches scholars with mentors, facilitates mentor-scholar communication, tracks mentoring sessions, and supports mentoring relationship development.

### User
- Primary: Scholars seeking mentors
- Secondary: Mentors providing guidance
- Context: Ongoing mentoring relationships, mentor search, session scheduling

### User Journey
```
Scholar navigates to Mentorship
    ↓
Scholar sees available mentors or current mentorship relationships
    ↓
Scholar can:
  • Browse and search for mentors
  • View mentor profiles and expertise
  • Send mentor request
  • View current mentoring relationships
  • Schedule sessions with mentors
  • Message mentors
  • Rate and review mentors
    ↓
Scholar can also:
  • Access mentorship resources
  • Track mentorship goals
  • Provide feedback after sessions
```

### Components

#### 1. Current Mentorships Widget
- List of current mentors
- For each mentor: Name, expertise, last contact date, next session date
- Quick actions: Message, Schedule Session, View Profile
- Status indicator (Active, Scheduled, Pending)

#### 2. Find a Mentor Section
- Search bar to find mentors by name
- Filter options:
  - Expertise area (tags: tech, business, healthcare, etc.)
  - Availability (evenings, weekends, flexible)
  - Meeting format (in-person, virtual, both)
  - Experience level (alumni, professional, peer)
- Browse mentors as cards showing:
  - Mentor name and title
  - Expertise tags
  - Availability
  - Brief bio
  - "View Profile" button
  - "Request Mentorship" button

#### 3. Mentor Profile
- Mentor name, title, company
- Photo
- Bio/About
- Expertise areas (tags)
- Years of experience
- Availability and meeting format
- Past mentees (count, anonymized)
- Languages spoken
- Calendar showing availability
- "Request Mentorship" button
- Reviews/ratings from past mentees

#### 4. Mentor Request Flow
- Modal or form showing:
  - Mentor name
  - Your goals for the relationship
  - Preferred meeting frequency
  - Preferred meeting format
  - Any questions for mentor
  - "Send Request" button
  - (Mentor receives request notification)

#### 5. Messaging
- Chat interface between scholar and mentor
- Message history
- Ability to share files/documents
- Typing indicator
- Read receipts

#### 6. Session Scheduling
- Calendar view with mentor's availability
- Select available time slot
- Set recurring sessions (optional)
- Session topic/agenda field
- Set reminders
- Video conference link auto-generated
- "Confirm Session" button

#### 7. Session Recording
- Session notes (scholar takes notes during session)
- Action items from session
- Next steps
- Goals discussed
- "Save Session Notes" button

#### 8. Mentorship Feedback & Ratings
- After session or at relationship milestone:
  - How helpful was this session? (1-5 stars)
  - What went well?
  - What could be improved?
  - Will you continue meeting? (yes/no)
  - Any comments for the mentor?

#### 9. Mentorship Resources
- Library of mentoring topics
- Guides on effective mentoring
- Goal-setting templates
- Reflection prompts
- "All Resources" link

### Data Source
- Mentor database (all available mentors)
- Mentorship relationship database
- Scholar profile (for matching)
- Messaging system
- Calendar/scheduling system
- Session records

### Database Fields

```typescript
interface Mentor {
  id: string;
  userId: string;
  name: string;
  title: string;
  company: string;
  profilePhotoUrl: string;
  bio: string;
  expertise: string[]; // Expertise tags
  yearsExperience: number;
  
  // Availability
  availability: {
    timezone: string;
    meetingTimes: TimeSlot[];
    meetingFormat: ('in_person' | 'virtual' | 'both')[];
    daysAvailable: string[]; // ['Monday', 'Wednesday', etc.]
  };
  
  // Contact Info
  email: string;
  phone?: string;
  linkedinUrl?: string;
  
  // Experience
  menteeCount: number;
  reviewCount: number;
  averageRating: number;
  
  // Status
  isActive: boolean;
  createdAt: Date;
}

interface MentorshipRelationship {
  id: string;
  scholarId: string;
  mentorId: string;
  
  status: 'pending' | 'active' | 'completed' | 'paused';
  
  // Relationship Info
  goalsForRelationship: string;
  mentorshipType: 'career' | 'academic' | 'personal_development' | 'general';
  
  // Preferences
  preferredMeetingFrequency: 'weekly' | 'biweekly' | 'monthly' | 'as_needed';
  preferredMeetingFormat: 'in_person' | 'virtual' | 'both';
  
  // Sessions
  sessions: MentorshipSession[];
  upcomingSessions: MentorshipSession[];
  
  // Feedback
  scholarFeedback?: {
    rating: number; // 1-5
    comments: string;
    date: Date;
  };
  mentorFeedback?: {
    rating: number;
    comments: string;
    date: Date;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface MentorshipSession {
  id: string;
  relationshipId: string;
  
  scheduledTime: Date;
  duration: number; // minutes
  meetingLink?: string;
  
  // Content
  agenda?: string;
  notes?: string;
  actionItems?: string[];
  
  // Status
  status: 'scheduled' | 'completed' | 'cancelled';
  
  createdAt: Date;
}

interface Message {
  id: string;
  relationshipId: string;
  senderId: string;
  receiverId: string;
  
  content: string;
  attachments?: {
    filename: string;
    url: string;
    type: string;
  }[];
  
  read: boolean;
  readAt?: Date;
  
  createdAt: Date;
}
```

### Permissions
- Scholar: Can request mentors, message own mentors, view own mentorships
- Mentor: Can accept/decline requests, message assigned scholars, view scholar info
- Advisor: Can view scholar's mentoring relationships (if authorized)
- Admin: Can view all mentorships (with privacy protections)

### Loading State
```
- Skeleton loaders for mentor cards
- Chat history loading animation
- "Finding mentors..." message
- Calendar loading while fetching availability
```

### Empty State
```
- No current mentors: "You don't have a mentor yet. Find one now!"
- No available mentors: "No mentors available with your filters. Try adjusting."
- No messages: "Start a conversation by messaging your mentor"
- No resources: "We'll add more mentorship resources soon!"
```

### Error State
```
- Mentor request failed: "Unable to send mentor request. Please try again."
- Session scheduling failed: "Failed to schedule session. Please try again."
- Message not sent: "Unable to send message. Check your connection."
- Mentor profile failed to load: "Unable to load mentor profile. Please refresh."
```

### Success State
- Mentor list loads with available mentors
- Mentor request sent successfully
- Session scheduled and confirmation sent
- Message sent and delivered
- Feedback submitted
- Mentorship created and displayed

### Mobile Behavior
- Vertical mentor card stack
- Full-width mentor profiles
- Chat interface optimized for mobile (larger text input)
- Calendar month view for session scheduling
- Bottom sheet for scheduling options
- Swipeable tabs between mentors/messages/sessions
- Simple one-tap "Message" and "Schedule" actions
- Notification badges for unread messages

### Accessibility
- Semantic structure for mentor list
- ARIA labels on mentor cards and availability
- Chat messages semantically structured
- Screen reader support for availability times
- Keyboard navigation through mentor list
- Focus management when opening modals
- Color not only indicator (use icons for status)
- Form labels clearly associated with inputs
- Skip links to mentor search and messages

### Definition of Done
- [ ] Mentor list loads and displays correctly
- [ ] Filters work accurately
- [ ] Mentor profiles display complete information
- [ ] Mentorship request submission works
- [ ] Messaging between scholar and mentor works
- [ ] Session scheduling functional
- [ ] Calendar shows mentor availability
- [ ] Session notes save correctly
- [ ] Feedback/ratings submission works
- [ ] Mentorship relationships display accurately
- [ ] Mobile layout tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Performance: mentor list loads <2 seconds
- [ ] Unit tests for matching algorithm
- [ ] E2E test for complete mentorship flow

---

## COURSES

### Purpose
Course discovery, enrollment, and management platform that helps scholars explore relevant courses, understand prerequisites and requirements, enroll in courses, and track academic progress.

### User
- Primary: Scholars browsing and enrolling in courses
- Secondary: Instructors (managing course info)
- Context: Course registration periods, ongoing semester

### User Journey
```
Scholar navigates to Courses
    ↓
Scholar sees available courses (filtered to their school)
    ↓
Scholar can:
  • Search courses by name, number, or topic
  • Filter by subject, term, difficulty, availability
  • View course details and reviews
  • Check prerequisites
  • See seat availability
  • Enroll in courses
  • View current enrollments
  • Drop courses (if allowed)
    ↓
Scholar clicks on course
    ↓
Course detail page loads
    ↓
Scholar enrolls or adds to watchlist
```

### Components

#### 1. Course Discovery
- Search bar for course code, name, or topic
- Featured/popular courses carousel
- Course browsing by subject/department

#### 2. Filters & Sorting
- Filter by:
  - Subject area (Computer Science, Chemistry, etc.)
  - Term (Fall 2026, Spring 2027, etc.)
  - Credit hours (1-4, 4+, etc.)
  - Difficulty level (Introductory, Intermediate, Advanced)
  - Format (In-person, Online, Hybrid)
  - Day/time availability
  - Instructor (optional)
  - Career-aligned (show courses aligned with my goals)
- Sort by: Name, Difficulty, Enrollment, Rating

#### 3. Course Card (in feed)
- Course code and name
- Department
- Instructor name
- Term and meeting times
- Credit hours
- Prerequisite list (collapsed)
- Rating/reviews count
- Seats available indicator
- Enrollment button or status badge
- "View Details" link

#### 4. Course Detail Page
- **Header**: Course code, name, department, term
- **Quick Info**: Credits, format, meeting times, location, instructor
- **Instructor Info**: Name, office hours, email, bio
- **Course Description**: Full description
- **Learning Objectives**: What students will learn
- **Prerequisites & Corequisites**: Prerequisites listed, indicator if scholar meets requirements
- **Required Materials**: Textbooks and materials with prices
- **Grading**: Grade breakdown (participation, exams, projects, etc.)
- **Reviews & Ratings**: 1-5 star rating with recent reviews
- **Seat Availability**: Real-time seat count
- **Enrollment Button**: "Enroll Now" or "Full - Join Waitlist" or "Enrollment Closed"
- **Cartridge/Wishlist**: "Add to Wishlist" button
- **Share**: Share button

#### 5. My Courses
- Current semester courses (table view)
- For each: Course name, instructor, meeting times, grade (if available)
- Quick actions: View course details, drop course (if allowed), message instructor
- Upcoming courses tab
- Past courses tab with final grades

#### 6. Prerequisites Check
- Visual flow showing prerequisite chain
- Indicator if scholar meets each prerequisite
- "Request Exception" button if prerequisite not met
- Explanation of why prerequisite is required

#### 7. Course Watchlist
- Saved courses scholar is considering
- Option to remove from list
- Enrollment reminder when seat opens
- Comparison tool (compare 2 courses side-by-side)

### Data Source
- Course catalog (course information)
- Enrollment data (seats available, waitlist)
- Scholar transcript (completed courses for prerequisite checking)
- Instructor database
- Reviews and ratings (from scholars)
- Course alignment data (career paths)

### Database Fields

```typescript
interface Course {
  id: string;
  schoolId: string;
  
  // Basic Info
  courseCode: string; // e.g., "CS 101"
  courseName: string;
  department: string;
  
  // Details
  description: string;
  learningObjectives: string[];
  credits: number;
  
  // Prerequisites
  prerequisites: {
    courseId: string;
    required: boolean; // Required vs. recommended
  }[];
  corequisites: string[]; // Courses taken concurrently
  
  // Scheduling
  term: string; // "Fall 2026", "Spring 2027", etc.
  meetingTimes: {
    days: string[]; // ['Monday', 'Wednesday', 'Friday']
    startTime: string; // "09:00"
    endTime: string; // "10:30"
    location: string;
  }[];
  
  format: 'in_person' | 'online' | 'hybrid';
  
  // Instructor
  instructorId: string;
  
  // Materials & Grading
  requiredMaterials: {
    title: string;
    type: 'textbook' | 'software' | 'other';
    price?: number;
    isbn?: string;
  }[];
  
  grading: {
    component: string; // "Participation", "Exams", etc.
    weight: number; // percentage
  }[];
  
  // Capacity
  capacity: number;
  enrolled: number;
  waitlistCapacity: number;
  waitlisted: number;
  
  // Reviews
  averageRating: number;
  reviewCount: number;
  
  // Status
  enrollmentOpen: boolean;
  enrollmentDeadline: Date;
  dropDeadline: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

interface ScholarCourseEnrollment {
  id: string;
  scholarId: string;
  courseId: string;
  
  enrollmentDate: Date;
  status: 'enrolled' | 'waitlisted' | 'completed' | 'dropped';
  
  // Grade (after completion)
  grade?: string; // "A", "B+", etc.
  gpa?: number; // 4.0, 3.7, etc.
  
  // Completion
  completionDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface CourseReview {
  id: string;
  courseId: string;
  scholarId: string;
  
  rating: number; // 1-5
  review: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  workload: 'light' | 'moderate' | 'heavy';
  
  recommendCourse: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Permissions
- Scholar: Can view all courses, enroll in eligible courses, review courses
- Instructor: Can view own course enrollments and course info
- Advisor: Can view scholar's current and past courses
- Admin: Can view all courses and enrollments
- Parent: View-only to scholar's current courses (if authorized)

### Loading State
```
- Skeleton loaders for course cards (while feed loads)
- Animated loading pulse
- "Loading courses..." message if >1 second
- Filters disabled while loading
```

### Empty State
```
- No courses matching filters: "No courses match your search. Try different filters."
- No available courses: "No courses available for this term yet."
- No enrollments: "You're not enrolled in any courses this term."
- No reviews: "No reviews yet. Be the first to review this course!"
```

### Error State
```
- Enrollment failed: "Unable to enroll. Please check prerequisites and try again."
- Course details failed to load: "Unable to load course details. Please refresh."
- Review submission failed: "Unable to submit review. Please try again."
- Drop failed: "Unable to drop course. The drop deadline may have passed."
```

### Success State
- Course list loads with courses
- Course detail page fully loaded
- Enrollment successful ("Enrolled in [Course Name]")
- Review submitted successfully
- Watchlist updated
- Drop confirmed

### Mobile Behavior
- Vertical course card feed
- Full-width cards with compact information
- Filters accessible via drawer/sheet
- Simplified course detail page (scroll vertically)
- Sticky enrollment button at bottom of detail page
- Mobile-friendly prerequisites visualization
- One-tap share and wishlist buttons
- Swipeable tabs between current/past courses

### Accessibility
- Semantic course list structure
- ARIA labels on filter buttons
- Screen reader support for seat availability
- Form labels for course search
- Keyboard navigation through course feed
- Focus management when opening detail page
- Color not only indicator (use text for seat availability)
- High contrast for enrollment buttons
- Skip links to course search

### Definition of Done
- [ ] Course list loads and displays correctly
- [ ] Filters and search work accurately
- [ ] Course detail page displays all information
- [ ] Prerequisite checking works correctly
- [ ] Enrollment submission successful
- [ ] Waitlist functionality works
- [ ] Drop course works (with date validation)
- [ ] Reviews display and submit correctly
- [ ] Watchlist add/remove works
- [ ] Mobile layout tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Performance: course list loads <2 seconds
- [ ] Unit tests for prerequisite logic
- [ ] E2E test for complete course enrollment flow

---

## ACHIEVEMENTS

### Purpose
Gamification and recognition system that celebrates scholar accomplishments, tracks progress toward goals, and motivates engagement with Scholar OS features. Achievements recognize both academic and platform activity milestones.

### User
- Primary: Scholars earning and viewing achievements
- Secondary: Mentors (viewing scholar achievements)
- Context: Ongoing motivation, portfolio/sharing, milestone celebrations

### User Journey
```
Scholar navigates to Achievements
    ↓
Scholar sees earned badges and achievements
    ↓
Scholar can:
  • View achievement details
  • See progress toward earned/upcoming achievements
  • Unlock new achievements through activities
  • Share achievements socially
  • Add achievements to profile/resume
  • Track achievement milestones
    ↓
Scholar completes activity
    ↓
Achievement notification appears
    ↓
Achievement added to profile
```

### Components

#### 1. Achievement Gallery
- Grid view of all achievements
- Earned achievements (full color/highlighted)
- Locked achievements (greyed out with lock icon)
- For each achievement:
  - Achievement icon/badge
  - Name
  - Brief description
  - Progress bar (if not yet earned)
  - Unlock criteria shown if locked
  - Date earned (if achieved)

#### 2. Achievement Detail Modal
- Large achievement icon/badge
- Achievement name and description
- How to earn this achievement
- Rarity indicator (how many other scholars have it)
- Date earned (if achieved)
- Share button
- Add to profile/resume button (if earned)

#### 3. Progress Tracking
- Upcoming achievements section
- For each: icon, name, progress bar showing % complete
- Example: "Profile Completeness: 75% complete"
- Encourage actions to progress toward achievement

#### 4. Achievement Categories/Filters
- Tabs or categories: Academic, Engagement, Mentorship, Career, Social
- Show only achievements from selected category

#### 5. Achievement Notifications
- Toast or banner when achievement unlocked
- "Congratulations! You earned the [Achievement Name] badge!"
- Achievement icon
- Share button in notification

#### 6. Leaderboard (Optional)
- Top achievers by achievement count
- "You're in the top X% of scholars"
- Achievement streaks
- Month/all-time tabs

#### 7. Achievement Showcase on Profile
- Prominent section showing 3-5 featured achievements
- "View All Achievements" link to full gallery

### Data Source
- Achievement definitions (rules for earning)
- Scholar activity tracking (courses completed, reviews written, etc.)
- Scholar profile progress
- Scholar engagement metrics

### Database Fields

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // URL to badge icon
  category: 'academic' | 'engagement' | 'mentorship' | 'career' | 'social';
  
  // Earning Criteria
  criterion: {
    type: 'activity' | 'milestone' | 'milestone_percentage';
    // Examples:
    // { type: 'activity', activity: 'write_review', count: 5 }
    // { type: 'milestone', milestone: 'profile_complete', percentage: 100 }
    activity?: string;
    count?: number;
    milestone?: string;
    percentage?: number;
  };
  
  // Metadata
  rarity: number; // percentage of users who have earned
  points: number; // XP/gamification points
  createdAt: Date;
}

interface ScholarAchievement {
  id: string;
  scholarId: string;
  achievementId: string;
  
  earnedAt: Date;
  
  // Optional: featured on profile
  featuredOnProfile: boolean;
  
  createdAt: Date;
}

interface ScholarAchievementProgress {
  id: string;
  scholarId: string;
  achievementId: string;
  
  progress: number; // Current progress towards achievement
  target: number; // Target to earn achievement
  status: 'locked' | 'in_progress' | 'earned';
  
  updatedAt: Date;
}
```

### Permissions
- Scholar: Can view own achievements, track progress, share achievements
- Mentor: Can view scholar achievements (if relationship exists)
- Public: Can view scholar's featured achievements if profile public
- Admin: Can view all achievements data

### Loading State
```
- Skeleton loaders for achievement grid
- Animated loading pulse on badges
- "Loading achievements..." message if >1 second
```

### Empty State
```
- No achievements yet: "Start earning achievements by engaging with Scholar OS! Complete your profile, write course reviews, or find a mentor."
- No in-progress achievements: "All currently available achievements are locked. Complete more activities to unlock them."
```

### Error State
```
- Failed to load achievements: "Unable to load achievements. Please refresh."
- Failed to unlock achievement: "Something went wrong. Your achievement may still have been earned. Check your list."
```

### Success State
- Achievement gallery fully loads
- Achievement unlocked notification appears
- Progress bars update
- Achievements display on profile
- Share successful

### Mobile Behavior
- Vertical scroll achievement gallery
- 2-column grid on mobile (instead of 3-4)
- Achievement detail in full-screen modal
- Swipeable between achievement categories
- Large achievement icons for mobile
- Toast notifications at bottom of screen
- Sticky achievement unlock notification

### Accessibility
- Semantic grid structure
- ARIA labels on achievement icons
- Screen reader support for progress ("5 out of 10 courses completed")
- Alt text for achievement icons
- Keyboard navigation through achievements
- Focus indicators on clickable badges
- Color not only indicator (use icons for locked/unlocked)
- Skip links to achievements gallery

### Definition of Done
- [ ] Achievement gallery displays all achievements
- [ ] Progress tracking accurate and updates in real-time
- [ ] Achievements unlock when criteria met
- [ ] Notifications display on unlock
- [ ] Achievement details display correctly
- [ ] Share functionality works
- [ ] Achievements display on profile
- [ ] Leaderboard (if included) shows correctly
- [ ] Mobile layout tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Performance: gallery loads <2 seconds
- [ ] Unit tests for achievement unlock logic
- [ ] E2E test for complete achievement flow

---

## NOTIFICATIONS

### Purpose
Central notification system that keeps scholars informed about important updates, deadlines, messages, and engagement opportunities across Scholar OS. Notifications drive timely action and keep scholars engaged.

### User
- Primary: All scholars using Scholar OS
- Secondary: Mentors (when scholar sends message or request)
- Context: Ongoing throughout user journey

### User Journey
```
Scholar receives notification:
  • Email notification
  • In-app notification (bell icon)
  • Push notification (mobile)
    ↓
Scholar can:
  • View notification in notification center
  • Click notification to navigate to relevant screen
  • Mark as read/unread
  • Archive or delete notifications
  • Set notification preferences
    ↓
Scholar can manage preferences:
  • Choose notification types to receive
  • Choose delivery methods (email, push, in-app)
  • Set quiet hours
  • Frequency settings (real-time, daily digest, weekly digest)
```

### Components

#### 1. Notification Bell Icon
- Bell icon in header
- Red badge showing unread notification count
- Click to open notification dropdown/center

#### 2. Notification Center (Dropdown/Page)
- List of notifications (newest first)
- For each notification:
  - Icon indicating type (deadline, message, achievement, etc.)
  - Notification title and message
  - Timestamp ("2 hours ago", "Mar 15", etc.)
  - Read/unread indicator
  - Action button ("View", "Apply", "Reply", etc.)
  - Mark as read/archive/delete options
- "Mark all as read" button
- Load more / pagination for older notifications
- Filter tabs: All, Unread, Messages, Deadlines, Opportunities, Achievements

#### 3. Notification Preferences
- Toggle notifications on/off by type:
  - Opportunity deadlines
  - Mentor messages
  - Course updates
  - Achievement unlocked
  - Profile recommendations
  - Mentorship requests
- Delivery method for each type:
  - Email
  - Push notification
  - In-app only
  - Disabled
- Quiet hours (e.g., "Don't notify between 10 PM - 8 AM")
- Frequency settings:
  - Real-time (as it happens)
  - Daily digest (once per day)
  - Weekly digest (once per week)

#### 4. Notification Types

**1. Opportunity Deadlines**
- Opportunity name
- Days until deadline countdown
- "Apply Now" button

**2. Mentor Messages**
- Mentor name
- Message preview
- "Reply" button

**3. Course Updates**
- Course name
- Update type (grade posted, assignment due, etc.)
- "View Course" button

**4. Achievement Unlocked**
- Achievement icon
- Achievement name
- "View Achievement" button

**5. Mentorship Request**
- Scholar/Mentor name (whoever sent request)
- "Accept" / "Decline" buttons

**6. Upcoming Sessions**
- Session type (course, mentoring, etc.)
- Session time and date
- "View Details" / "Reschedule" button

**7. Profile Recommendations**
- Recommendation type (skills to add, courses to take, etc.)
- "View Profile" button

#### 5. Notification Settings Page
- Full notification preferences
- Toggle each notification type
- Choose delivery method per type
- Quiet hours time picker
- Frequency selector per type
- "Save Preferences" button
- "Reset to Defaults" button

### Data Source
- Scholar activity and events across platform
- Notification rules engine (what triggers what notification)
- Notification delivery service (email, push, in-app)
- Scholar notification preferences

### Database Fields

```typescript
interface Notification {
  id: string;
  scholarId: string;
  
  // Content
  type: 'deadline' | 'message' | 'course_update' | 'achievement' | 'mentorship' | 'session' | 'recommendation';
  title: string;
  message: string;
  icon: string; // URL or icon name
  
  // Action
  actionUrl?: string; // URL to navigate to when clicked
  actionText?: string; // e.g., "Apply Now"
  
  // Metadata
  relatedEntityId?: string; // ID of opportunity, course, mentor, etc.
  relatedEntityType?: string; // Type of entity
  
  // Status
  isRead: boolean;
  isArchived: boolean;
  
  createdAt: Date;
  expiresAt?: Date; // When notification expires
}

interface NotificationPreferences {
  id: string;
  scholarId: string;
  
  // Notification Types
  notifications: {
    type: string; // e.g., 'opportunity_deadline'
    enabled: boolean;
    deliveryMethods: ('email' | 'push' | 'in_app')[];
    frequency: 'real_time' | 'daily' | 'weekly';
  }[];
  
  // Quiet Hours
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
  };
  
  // General
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  
  updatedAt: Date;
}
```

### Permissions
- Scholar: Can manage own notification preferences
- System: Can send notifications to scholars based on triggers
- Admin: Can view notification delivery logs
- Mentor: Receives notifications about scholar interactions

### Loading State
```
- Notification bell shows loading spinner if fetching
- Notification center shows skeleton loaders while loading
- "Loading notifications..." message if >1 second
```

### Empty State
```
- No notifications: "You're all caught up! 🎉 No new notifications"
- No unread notifications: "All notifications read"
- No notifications for selected filter: "No [type] notifications"
```

### Error State
```
- Failed to load notifications: "Unable to load notifications. Please refresh."
- Failed to mark as read: "Unable to update notification. Try again."
- Failed to send notification: "Notification delivery failed. Try again."
- Preferences failed to save: "Unable to save preferences. Please try again."
```

### Success State
- Notification center loads with notifications
- Notification marked as read
- Preference changes saved
- Action button in notification works (navigates to correct page)
- New notification appears immediately

### Mobile Behavior
- Full-screen notification center
- Vertical list of notifications
- Swipeable to archive/delete notifications
- Large touch targets for action buttons
- Notification center accessible from mobile header
- Push notification preview on lock screen
- Tap notification to navigate to relevant page
- Bottom sheet for notification preferences

### Accessibility
- Bell icon has ARIA label
- Unread count announced by screen reader
- Notification list is semantic list
- Each notification is readable by screen reader
- Timestamp format readable ("2 hours ago")
- Action buttons clearly labeled
- Keyboard navigation through notifications
- Skip links to notification center
- Color not only indicator (use icons for notification type)

### Definition of Done
- [ ] Notification bell displays with unread count
- [ ] Notification center loads notifications
- [ ] Notifications marked as read work
- [ ] All notification types display correctly
- [ ] Notification preferences save correctly
- [ ] Quiet hours respected (notifications don't send)
- [ ] Email notifications send correctly
- [ ] Push notifications send correctly
- [ ] Action buttons navigate correctly
- [ ] Mobile layout tested
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Performance: notification center loads <1 second
- [ ] Unit tests for notification filtering
- [ ] E2E test for complete notification flow

---

## Cross-Feature Requirements

### Performance
- All screens load in <3 seconds
- Data updates reflect within 5 seconds
- Mobile apps perform well on 4G connections
- Images optimized and lazy-loaded
- Infinite scroll or pagination for large lists

### Security & Privacy
- All data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest
- User roles and permissions enforced
- Privacy settings respected throughout
- GDPR compliant data handling
- Rate limiting on API endpoints

### Responsive Design
- All screens work on desktop (1200px+), tablet (768px-1199px), mobile (320px-767px)
- Touch-friendly on mobile (44px minimum touch targets)
- Mobile-first design approach
- Breakpoints: 320px, 768px, 1200px

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)
- Mobile browsers (Safari iOS, Chrome Android)

### Accessibility Standards
- WCAG 2.1 AA compliance minimum
- All features keyboard accessible
- Semantic HTML
- ARIA labels where needed
- Screen reader tested
- Color contrast ratio 4.5:1 minimum for text
- Focus indicators visible
- Error messages clear and associated with fields

### Analytics & Monitoring
- Track user engagement metrics
- Monitor error rates and exceptions
- Performance metrics collection
- User flow tracking
- Feature adoption metrics
- Accessibility compliance monitoring

### Testing Requirements
- Unit tests: >80% code coverage
- Integration tests for feature flows
- E2E tests for critical user journeys
- Accessibility testing (manual + automated)
- Performance testing under load
- Mobile testing on real devices
- Usability testing with target users

---

## Implementation Priorities

### Phase 1 (MVP - Week 1-2)
- Onboarding (complete flow)
- Profile (basic info + edit)
- Dashboard (simplified)
- Courses (discovery + enrollment)
- Notifications (in-app only)

### Phase 2 (Week 3-4)
- Full Dashboard (all sections)
- Opportunities (discovery + application)
- Mentorship (basic matching + messaging)
- Resume Intelligence (basic builder)

### Phase 3 (Week 5-6)
- Compass (career pathing)
- Achievements (full gamification)
- Advanced Mentorship (scheduling, sessions)
- Email/Push notifications

### Phase 4 (Week 7+)
- Mobile native apps
- Advanced analytics
- AI recommendations enhancement
- Performance optimization

---

**Document Version**: 1.0.0  
**Status**: Codex-Ready  
**Last Updated**: July 27, 2026  
**Next Review**: When implementation begins

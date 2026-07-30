# SCHOLAR-HOME

**Purpose:** Personal growth command center.  
**Primary role:** Scholar  
**Secondary roles:** Parent, mentor, counselor with consent

**User goals:** Understand identity and mission; review goals and journey; see progress; choose a next action; discover opportunities; manage support.  
**Hierarchy:** Identity and mission -> next action -> goals and progress -> journey -> opportunities -> support network -> achievements.  
**Components:** PB-NAV-001, PB-MODULE-001, PB-JOURNEY-001, PB-PROGRESS-001, PB-OPPORTUNITY-001, PB-COMPASS-001.  
**Data:** Scholar Home read model, Scholar Record, Journey, consent, opportunities, recommendation evidence.  
**Actions:** Confirm, modify, defer, or reject action; review evidence; open path; manage support.  
**Permissions:** `VIEW_SCHOLAR_HOME`, scoped support permissions.  
**Navigation:** `/scholar`; exits to journey, record, opportunities, and network.  
**APIs/Database:** Governed read models only; no direct table ownership.  
**States:** Stable skeleton; evidence-building empty state; source-specific recoverable error; trusted success; permission explanation; privacy/consent control.  
**Responsive:** Mobile prioritizes next action; desktop supports path comparison.  
**Accessibility:** Landmarks, keyboard order, labeled progress, announced recommendation state, non-color trust meaning.

# PBOS Scholar OS Application Composition Architecture

**Purpose:** Define the Scholar Personal Development Operating System composition.  
**Owner:** Playbook OS Product and Experience Architecture  
**Last Updated:** July 30, 2026

## Information Architecture

Scholar OS organizes around Journey, Academic, Athletic, Career, Opportunity, Financial Literacy, Mentorship, and Growth paths. Scholar Record is the evidence backbone; Mission, Opportunity, Compass, Resume, and Mentor intelligence provide explainable assistance.

## Navigation And Screens

Global navigation exposes Home, Journey, Record, Opportunities, Connections, Messages, and Profile. Each path has overview, next action, evidence, history, and support views. Deep links preserve role, organization, permission, and return context.

## Workflows

Core workflows are establish goals, review evidence, choose a next action, request guidance, submit or verify evidence, evaluate progress, recover from failure, and revise the journey. Recommendations show evidence, reasoning, confidence, alternatives, and confirmation.

## Components And Data

Shared primitives include journey timeline, evidence item, recommendation explanation, progress measure, opportunity match, mentor interaction, consent control, status panel, and recovery action. Components consume role-safe view models, not unrestricted records.

## States And Accessibility

Every screen defines loading, empty, success, error, permission, offline, stale-data, and recovery states. Interfaces meet Volume 34/35 accessibility and responsive standards, support keyboard and assistive technology, preserve readable focus order, and avoid color-only meaning.

## Responsive Behavior

Mobile prioritizes next action, evidence capture, messages, and navigation continuity. Desktop supports comparison and planning without introducing a separate authority or data model.

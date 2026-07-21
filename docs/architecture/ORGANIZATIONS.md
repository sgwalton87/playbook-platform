# Organizations

Version: 1.0

Status: Canonical

Owner: Platform Architecture

Related Documents

- FOUNDATION.md
- RELATIONSHIPS.md
- PLAYBOOK_STACK.md
- SECURITY_MODEL.md
- ENGINE_CONTRACT.md

---

# Purpose

The Organization model defines the environments in which Participants collaborate, learn, compete, work, build ventures, and engage with communities throughout the Playbook platform.

Organizations are first-class canonical entities.

Organizations provide context.

Organizations never own Participants.

Organizations establish operational boundaries while preserving participant ownership of identity and evidence.

---

# Philosophy

Participants are lifelong.

Organizations are temporary.

Participants move between Organizations throughout life.

Schools.

Universities.

Employers.

Sports Teams.

Businesses.

Government Agencies.

Communities.

Accelerators.

Nonprofits.

Organizations come and go.

Participants remain.

---

# Core Principles

Organizations provide environments.

Organizations define administrative boundaries.

Organizations contribute Evidence.

Organizations never own Participant identity.

Organizations never own Participant Records.

Organizations never own verified Evidence.

Organizations establish context.

Policies determine authority.

Permissions are computed.

---

# Canonical Definition

An Organization is an operational environment in which Participants interact through structured programs, teams, departments, communities, ventures, or events.

Organizations are independent of Participant identity.

---

# Organization Components

Organization ID

Organization Type

Legal Name

Display Name

Description

Status

Website

Brand Assets

Contact Information

Locations

Verification Status

Policies

Membership Rules

Parent Organization

Metadata

Audit History

---

# Organization Types

## Education

School

Charter School

School District

College

University

Community College

Trade School

Training Provider

Research Institution

---

## Athletics

Athletic Club

AAU Team

High School Team

College Team

Professional Team

League

Conference

Tournament Organizer

Sports Academy

---

## Business

Corporation

LLC

Startup

Partnership

Sole Proprietorship

Holding Company

Consulting Firm

Agency

---

## Nonprofit

Foundation

Community Organization

Faith Organization

Advocacy Organization

Charitable Organization

Youth Organization

---

## Government

City

County

State Agency

Federal Agency

Public Authority

School Board

Special District

---

## Community

Neighborhood Association

Alumni Network

Professional Association

Affinity Group

Volunteer Network

---

## Platform

Platform Administrator

Marketplace Partner

Technology Partner

Content Partner

Verification Partner

---

# Organization Hierarchy

Organizations may contain other Organizations.

Example:

University

↓

College

↓

Department

↓

Program

↓

Course

Example:

Corporation

↓

Division

↓

Department

↓

Team

Example:

School District

↓

School

↓

Grade Level

↓

Classroom

Hierarchy is unlimited.

---

# Organizational Units

Organizations may define:

Departments

Programs

Teams

Cohorts

Communities

Committees

Boards

Divisions

Campuses

Regions

Each unit inherits Organization context.

---

# Membership

Participants may belong to multiple Organizations simultaneously.

Examples:

Scholar

↓

High School

↓

AAU Team

↓

Nonprofit

↓

Startup

↓

Faith Organization

↓

Volunteer Group

Membership is independent for each Organization.

---

# Membership Types

Owner

Administrator

Manager

Faculty

Staff

Coach

Mentor

Advisor

Volunteer

Student

Scholar

Athlete

Founder

Investor

Board Member

Parent

Guardian

Guest

Observer

Membership type influences organizational responsibilities.

Membership type does not directly grant permissions.

---

# Membership Lifecycle

Invited

↓

Pending

↓

Accepted

↓

Active

↓

Suspended

↓

Inactive

↓

Ended

↓

Historical

Membership history is permanent.

---

# Verification

Organizations may be:

Unverified

Platform Verified

Institution Verified

Government Verified

Accredited

Verification influences trust.

Verification does not replace Policy evaluation.

---

# Organizational Policies

Organizations define local rules.

Examples:

Admission requirements

Course enrollment

Coach assignments

Recruiting restrictions

Communication rules

Volunteer requirements

Financial aid eligibility

Organization Policies never override Platform Policies.

---

# Administrative Boundaries

Organizations manage:

Programs

Teams

Departments

Courses

Events

Communities

Opportunities

Membership

Organizations never manage:

Identity

Participant Records

Verified Evidence

Platform Policies

Global Permissions

---

# Programs

Programs belong to Organizations.

Examples:

Summer Academy

Entrepreneurship Incubator

Basketball Camp

Leadership Fellowship

Mentorship Program

Programs inherit Organization Policies.

---

# Teams

Teams belong to Organizations.

Examples:

Basketball Team

Project Team

Startup Team

Research Team

Volunteer Team

Teams may span multiple Programs.

---

# Cohorts

Cohorts represent time-bound participant groups.

Examples:

Fall 2026 Cohort

Leadership Class

Startup Accelerator Batch

Scholar Fellowship

Cohorts are organizational structures.

---

# Workspaces

Organizations may expose Workspaces.

Examples:

Dashboard

Learning Portal

Community Feed

Recruiting Portal

Administration Portal

Workspace visibility is determined through Context and Permissions.

---

# Multi-Tenancy

Organizations create tenancy boundaries.

Participants may belong to many tenants.

Participant identity exists outside tenancy.

Evidence exists outside tenancy.

Opportunity matching may span tenants when permitted by Policy.

---

# Privacy

Organization visibility depends upon:

Policies

Permissions

Relationships

Consent

Context

Verification

Organizations cannot expose participant information outside authorized boundaries.

---

# Audit

Organizations record:

Creation

Verification

Policy changes

Membership changes

Administrative actions

Program creation

Team creation

Hierarchy changes

Audit history is immutable.

---

# Security

Organizations provide scope.

Policies provide authority.

Permissions provide access.

Relationships provide trust.

Identity provides authentication.

Organizations never bypass platform security.

---

# AI

Compass consumes Organization context.

Compass may:

Recommend Organizations

Recommend Programs

Recommend Communities

Recommend Teams

Explain Organization structure

Compass may not:

Create Organizations

Delete Organizations

Modify Organization Policies

Only Organization Engines manage Organizations.

---

# Examples

Example 1

Scholar joins High School.

↓

Membership Created

↓

Organization Policies Applied

↓

Participant Context Updated

---

Example 2

Founder joins Accelerator.

↓

Program Membership

↓

Mentor Relationships

↓

Startup Opportunities

---

Example 3

Athlete joins AAU Team.

↓

Team Membership

↓

Coach Relationships

↓

Competition Evidence

---

Example 4

Volunteer joins Nonprofit.

↓

Volunteer Membership

↓

Community Events

↓

Service Evidence

---

# Domain Invariants

Organizations never own Participants.

Organizations never own Participant Records.

Organizations never own verified Evidence.

Organizations define environments.

Membership is independent of Identity.

Policies govern Organizations.

Permissions are computed.

Audit history is immutable.

---

# Relationship to the Playbook Stack

Participant

↓

Organization

↓

Programs

↓

Teams

↓

Communities

↓

Evidence

↓

Participant Record

↓

Opportunity Engine

Organizations provide the environments where participant experiences occur.

Participants retain ownership of their lifelong identity and accomplishments.

---

# Definition of Done

The Organization architecture is complete when:

✓ Organization types are documented.

✓ Hierarchies are defined.

✓ Membership model exists.

✓ Membership lifecycle is documented.

✓ Verification model exists.

✓ Policy boundaries are defined.

✓ Administrative boundaries are documented.

✓ Multi-tenancy is supported.

✓ Security integration exists.

✓ AI interaction is documented.

✓ Domain invariants are enforced.

Only then may implementation begin.
# PBOS-RLS-001 Profiles Schema Gap Discovery

**Date:** 2026-07-27  
**Gate:** PBOS-RLS-001 — Validate production RLS and role access  
**Status:** Confirmed Discovery

---

## Finding

A fresh Supabase initialization exposed that the repository depends on `public.profiles`, but the canonical table creation migration is not present in the committed migration history.

---

## Evidence

Migration references found:

### 20260701_playbook_graph.sql

References:

```sql
profile_id uuid references public.profiles(id)
created_by uuid references public.profiles(id)
updated_by uuid references public.profiles(id)
verified_by uuid references public.profiles(id)

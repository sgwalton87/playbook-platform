-- Governance: invitation codes are per-invitation locators, not authorization.
-- Recipient authentication, exact-email validation and relationship verification
-- remain enforced by existing support invitation RLS and accept RPC.
ALTER TABLE public.support_invitations ADD COLUMN IF NOT EXISTS invite_code text;
CREATE UNIQUE INDEX IF NOT EXISTS support_invitations_invite_code_unique
  ON public.support_invitations(invite_code) WHERE invite_code IS NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'support_invitations_invite_code_format'
      AND conrelid = 'public.support_invitations'::regclass
  ) THEN
    ALTER TABLE public.support_invitations ADD CONSTRAINT support_invitations_invite_code_format
      CHECK (invite_code IS NULL OR invite_code ~ '^[A-Z0-9_-]{12}$');
  END IF;
END $$;

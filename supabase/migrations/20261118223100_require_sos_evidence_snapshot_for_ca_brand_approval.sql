-- An explicit human-reviewed registry screenshot is required before an
-- initially pending California Brand Partner can be approved. Screenshot
-- proves evidence was submitted by an authorized reviewer, NOT authenticity.
CREATE OR REPLACE FUNCTION private.validate_brand_registration_before_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
BEGIN
 IF new.status='approved' AND (TG_OP='INSERT' OR old.status IS DISTINCT FROM 'approved') THEN
  IF NOT EXISTS(
   SELECT 1 FROM public.brand_partner_registration_details d
   WHERE d.brand_user_id=new.brand_user_id AND d.safeguarding_accepted
     AND d.safety_answers->>'minors' IN ('no','yes','private_review')
     AND d.safety_answers->>'financial' IN ('no','yes','private_review')
     AND d.safety_answers->>'violence' IN ('no','yes','private_review')
     AND d.safety_answers->>'pending' IN ('no','yes','private_review')
     AND d.safety_answers->>'restrictions' IN ('no','yes','private_review')
  ) THEN RAISE EXCEPTION 'Business registration and safeguarding declarations are required before approval' USING errcode='23514'; END IF;
  IF NOT EXISTS(
   SELECT 1 FROM public.verification_community_consents c
   WHERE c.user_id=new.brand_user_id AND c.policy_version='playbook-safety-v2-20261028'
  ) THEN RAISE EXCEPTION 'Current community standards acknowledgement required before approval' USING errcode='23514'; END IF;
  IF NOT EXISTS(
   SELECT 1 FROM public.brand_partner_registry_reviews v
   WHERE v.request_id=new.id AND v.result->>'human_outcome' IN ('matched_active','alternative_verified')
     AND v.result->>'safety_reviewed'='true'
  ) THEN RAISE EXCEPTION 'Human registration and safeguarding review are required before approval' USING errcode='23514'; END IF;
  IF EXISTS(
   SELECT 1 FROM public.brand_partner_registration_details d
   WHERE d.brand_user_id=new.brand_user_id AND d.formation_state='California'
  ) AND NOT EXISTS(
   SELECT 1 FROM public.brand_registry_review_snapshots s WHERE s.request_id=new.id
  ) THEN RAISE EXCEPTION 'A retained California registry screenshot is required before approval' USING errcode='23514'; END IF;
 END IF;
 RETURN new;
END;
$function$;
REVOKE EXECUTE ON FUNCTION private.validate_brand_registration_before_approval() FROM PUBLIC, anon, authenticated;

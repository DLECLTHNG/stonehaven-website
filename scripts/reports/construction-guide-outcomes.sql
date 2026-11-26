-- psql -X -v ON_ERROR_STOP=1 -v start=2026-11-24 -v stop=2026-12-22 -f scripts/reports/construction-guide-outcomes.sql
-- Start is inclusive and stop exclusive, both New York calendar dates.
-- Count CRM leads by the originating intake, one row per lead. The latest
-- explicit team decision at report time applies even if made after intake.
BEGIN READ ONLY;
WITH guides(guide, ordering) AS (
  VALUES ('owned-land', 1), ('lot-release', 2), ('interest-reserve', 3), ('unattributed', 4)
), intake AS (
  SELECT l.id,
    CASE WHEN l.intake_extra->>'construction_guide' IN ('owned-land','lot-release','interest-reserve')
         THEN l.intake_extra->>'construction_guide' ELSE 'unattributed' END AS guide
  FROM "Lead" l
  WHERE l."sourceChannel" = 'website' AND l.product = 'Commercial'
    AND l.intake_extra->>'source_form_id' IN (
      'quick-construction-loan-calculator','quick-es-construction-loan-calculator',
      'quick-commercial-construction-loans','quick-es-commercial-construction-loans',
      'quick-construction-interest-reserve','quick-es-construction-interest-reserve',
      'commercial-construction-loans')
    AND l."createdAt" >= (:'start'::date::timestamp AT TIME ZONE 'America/New_York' AT TIME ZONE 'UTC')
    AND l."createdAt" < (:'stop'::date::timestamp AT TIME ZONE 'America/New_York' AT TIME ZONE 'UTC')
    AND concat_ws(' ',l.name,l.email,l.intake_extra::text) !~* 'SHQA[0-9]{8}|monitor canary'
    AND coalesce(l.email,'') !~* '@example\.(com|net|org)$'
), outcomes AS (
  SELECT i.*, decision.status
  FROM intake i LEFT JOIN LATERAL (
    SELECT lower(trim(a.body)) AS status
    FROM "Activity" a
    WHERE a."leadId" = i.id AND a.kind = 'note' AND a."actorId" IS NOT NULL
      AND lower(trim(a.body)) IN ('construction qualified','construction not qualified','construction spam/test')
    ORDER BY a."createdAt" DESC, a.id DESC LIMIT 1
  ) decision ON true
  WHERE decision.status IS DISTINCT FROM 'construction spam/test'
)
SELECT g.guide, count(o.id) AS crm_inquiries,
  count(*) FILTER (WHERE o.status = 'construction qualified') AS qualified,
  count(*) FILTER (WHERE o.status = 'construction not qualified') AS not_qualified,
  count(o.id) FILTER (WHERE o.status IS NULL) AS awaiting_review
FROM guides g LEFT JOIN outcomes o USING (guide)
GROUP BY g.guide, g.ordering ORDER BY g.ordering;
COMMIT;

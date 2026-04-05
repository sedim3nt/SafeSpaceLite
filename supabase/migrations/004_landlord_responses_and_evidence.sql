-- 004_landlord_responses_and_evidence.sql
-- Adds evidence certainty to safety reports and paid landlord responses for rental reviews.

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS evidence_tier TEXT NOT NULL DEFAULT 'narrative_only',
  ADD COLUMN IF NOT EXISTS evidence_details TEXT,
  ADD COLUMN IF NOT EXISTS issue_started_at DATE,
  ADD COLUMN IF NOT EXISTS landlord_notified_at DATE;

ALTER TABLE reports
  DROP CONSTRAINT IF EXISTS reports_evidence_tier_check;

ALTER TABLE reports
  ADD CONSTRAINT reports_evidence_tier_check
  CHECK (
    evidence_tier IN (
      'narrative_only',
      'photo_documentation',
      'third_party_test',
      'official_finding'
    )
  );

UPDATE reports
SET evidence_tier = CASE
  WHEN photo_urls IS NOT NULL AND array_length(photo_urls, 1) > 0 THEN 'photo_documentation'
  ELSE 'narrative_only'
END
WHERE evidence_tier IS NULL;

CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES rental_reviews(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES landlords(id) ON DELETE CASCADE,
  landlord_email TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  body TEXT NOT NULL CHECK (char_length(body) <= 1000),
  stripe_payment_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_responses_property ON review_responses(property_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_landlord ON review_responses(landlord_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_review_responses_review_unique
  ON review_responses(review_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rebuttals_report_unique
  ON rebuttals(report_id);

ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_responses_select"
  ON review_responses FOR SELECT
  USING (true);

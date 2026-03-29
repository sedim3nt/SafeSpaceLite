-- 002_rental_experience_review.sql
-- Rental Experience Review: landlord ratings, reviews, and aggregate scores

-- Landlords table
CREATE TABLE landlords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  management_company TEXT,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('property_owner', 'management_company', 'master_tenant', 'owner_occupant', 'coop')),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(name, property_id, relationship_type)
);

-- Rental reviews table
CREATE TABLE rental_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES landlords(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('property_owner', 'management_company', 'master_tenant', 'owner_occupant', 'coop')),
  responsiveness INT NOT NULL CHECK (responsiveness BETWEEN 1 AND 5),
  fairness INT NOT NULL CHECK (fairness BETWEEN 1 AND 5),
  respect INT NOT NULL CHECK (respect BETWEEN 1 AND 5),
  temperament INT NOT NULL CHECK (temperament BETWEEN 1 AND 5),
  property_condition INT NOT NULL CHECK (property_condition BETWEEN 1 AND 5),
  communication INT NOT NULL CHECK (communication BETWEEN 1 AND 5),
  safety INT NOT NULL CHECK (safety BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  comment TEXT CHECK (char_length(comment) <= 500),
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reviewer_id, landlord_id)
);

-- Indexes
CREATE INDEX idx_landlords_property_id ON landlords(property_id);
CREATE INDEX idx_rental_reviews_property_id ON rental_reviews(property_id);
CREATE INDEX idx_rental_reviews_landlord_id ON rental_reviews(landlord_id);

-- RLS policies
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read landlords"
  ON landlords FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert landlords"
  ON landlords FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can read rental reviews"
  ON rental_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert rental reviews"
  ON rental_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Aggregate scores view
CREATE VIEW landlord_scores AS
SELECT
  landlord_id,
  COUNT(*) as review_count,
  ROUND(AVG(responsiveness)::numeric, 1) as avg_responsiveness,
  ROUND(AVG(fairness)::numeric, 1) as avg_fairness,
  ROUND(AVG(respect)::numeric, 1) as avg_respect,
  ROUND(AVG(temperament)::numeric, 1) as avg_temperament,
  ROUND(AVG(property_condition)::numeric, 1) as avg_property_condition,
  ROUND(AVG(communication)::numeric, 1) as avg_communication,
  ROUND(AVG(safety)::numeric, 1) as avg_safety,
  ROUND(((AVG(responsiveness) + AVG(fairness) + AVG(respect) + AVG(temperament) + AVG(property_condition) + AVG(communication) + AVG(safety)) / 7)::numeric, 1) as overall_score
FROM rental_reviews
GROUP BY landlord_id;

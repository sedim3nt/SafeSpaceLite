CREATE TABLE IF NOT EXISTS property_landlord_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  landlord_user_id UUID NOT NULL,
  landlord_email TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  body TEXT NOT NULL CHECK (char_length(body) <= 1000),
  stripe_payment_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_landlord_statements_property_unique
  ON property_landlord_statements(property_id);

CREATE INDEX IF NOT EXISTS idx_property_landlord_statements_user
  ON property_landlord_statements(landlord_user_id);

ALTER TABLE property_landlord_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_landlord_statements_select"
  ON property_landlord_statements FOR SELECT
  USING (true);

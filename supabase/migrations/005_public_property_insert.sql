-- 005_public_property_insert.sql
-- Property records are public address shells and must be creatable before auth
-- so lookup, review, and reporting flows can normalize any valid U.S. address.

DROP POLICY IF EXISTS "properties_insert" ON properties;

CREATE POLICY "properties_insert"
  ON properties FOR INSERT
  WITH CHECK (true);

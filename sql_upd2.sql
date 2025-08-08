ALTER TABLE investor_milestones
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

-- (facultatif, si tu veux que Postgres le mette à jour automatiquement)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS investor_milestones_set_updated_at ON investor_milestones;

CREATE TRIGGER investor_milestones_set_updated_at
BEFORE UPDATE ON investor_milestones
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

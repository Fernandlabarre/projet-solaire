-- 1. Table des utilisateurs
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)       NOT NULL,
  email VARCHAR(255)      NOT NULL UNIQUE,
  password_hash TEXT      NOT NULL,
  role VARCHAR(50)        NOT NULL DEFAULT 'user'
);

-- 2. Table des projets
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT               NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  type TEXT,
  power NUMERIC,
  phone TEXT,
  email TEXT,
  comments TEXT,
  owner_id INTEGER,
  status VARCHAR(50)      NOT NULL DEFAULT 'En cours',
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Table des champs personnalisés
CREATE TABLE project_custom_fields (
  id SERIAL PRIMARY KEY,
  project_id INTEGER      NOT NULL,
  field_name TEXT         NOT NULL,
  field_value TEXT,
  added_by INTEGER,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by)   REFERENCES users(id)    ON DELETE SET NULL
);

-- 4. Table des étapes de suivi
CREATE TABLE project_steps (
  id SERIAL PRIMARY KEY,
  project_id INTEGER      NOT NULL,
  label TEXT              NOT NULL,
  step_date DATE,
  step_comment TEXT,
  status VARCHAR(50),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 5. Table des invitations
CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER      NOT NULL,
  email VARCHAR(255)      NOT NULL,
  token VARCHAR(64)       NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Index pour accélérer la recherche par token
CREATE UNIQUE INDEX idx_invitations_token ON invitations(token);

-- 1. Investisseurs
CREATE TABLE IF NOT EXISTS investors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Lien Projet <-> Investisseur
CREATE TABLE IF NOT EXISTS project_investors (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  role TEXT, -- ex: "lead", "co"
  UNIQUE (project_id, investor_id)
);

-- 3. Statut des jalons (ENUM) ou texte contrôlé
DO $$ 
BEGIN
  CREATE TYPE milestone_status AS ENUM ('', 'Payé', 'Pas payé', 'Annulé', 'En cours');
EXCEPTION 
  WHEN duplicate_object THEN NULL; 
END $$;


-- 4. Jalons par investisseur et projet
CREATE TABLE IF NOT EXISTS investor_milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  due_date DATE,
  status milestone_status DEFAULT 'En cours',
  comment TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE projects ADD COLUMN updated_at timestamptz DEFAULT NOW();
-- 2) Fonction générique si pas déjà présente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Trigger
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
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

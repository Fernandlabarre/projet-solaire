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

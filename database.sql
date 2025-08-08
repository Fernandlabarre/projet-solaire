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

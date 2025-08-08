const pool = require('../utils/db');
const { geocodeAddress } = require('../utils/geocode');

// Récupérer tous les projets
const getAllProjects = async () => {
  const { rows } = await pool.query('SELECT * FROM projects');
  return rows;
};

// Récupérer les projets par owner
const getProjectsByOwnerId = async (owner_id) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE owner_id = $1', [owner_id]);
  return rows;
};

// Créer un projet
const createProject = async (project) => {
  const { name, address, latitude, longitude, type, power, phone, email, comments, owner_id, status } = project;
  const fixedOwnerId = owner_id === "" ? null : owner_id;
  console.log("CREATE project (status):", status); // DEBUG
  const { rows } = await pool.query(
    `INSERT INTO projects 
      (name, address, latitude, longitude, type, power, phone, email, comments, owner_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [name, address, latitude || null, longitude || null, type, power, phone, email, comments, fixedOwnerId, status || 'En cours']
  );
  return rows[0];
};

const addCustomField = async (project_id, field_name, field_value, user_id = null) => {
  const { rows } = await pool.query(
    'INSERT INTO project_custom_fields (project_id, field_name, field_value, added_by) VALUES ($1, $2, $3, $4) RETURNING *',
    [project_id, field_name, field_value, user_id]
  );
  return rows[0];
};

const getCustomFields = async (project_id) => {
  const { rows } = await pool.query(
    'SELECT * FROM project_custom_fields WHERE project_id = $1',
    [project_id]
  );
  return rows;
};

const updateCustomField = async (field_id, field_name, field_value) => {
  const { rows } = await pool.query(
    'UPDATE project_custom_fields SET field_name = $1, field_value = $2 WHERE id = $3 RETURNING *',
    [field_name, field_value, field_id]
  );
  return rows[0];
};

const deleteCustomField = async (field_id) => {
  await pool.query('DELETE FROM project_custom_fields WHERE id = $1', [field_id]);
};

// Mettre à jour un projet
const updateProject = async (id, project) => {
  // --- LOG DÉTAILLÉ
  console.log("updateProject() : id =", id);
  console.log("Projet reçu par updateProject :", project);

  const { name, address, latitude, longitude, type, power, phone, email, comments, owner_id, status } = project;
  console.log("Champs utilisés pour l'UPDATE :");
  console.log({ name, address, latitude, longitude, type, power, phone, email, comments, owner_id, status });

  const params = [
    name, address, latitude || null, longitude || null,
    type, power, phone, email, comments, owner_id, status || 'En cours', id
  ];
  console.log("Paramètres SQL envoyés :", params);

  const { rows } = await pool.query(
    `UPDATE projects SET 
      name=$1, address=$2, latitude=$3, longitude=$4, type=$5, power=$6, phone=$7, email=$8, comments=$9, owner_id=$10, status=$11 
     WHERE id=$12 RETURNING *`,
    params
  );
  console.log("Résultat UPDATE :", rows[0]);
  return rows[0];
};

// Supprimer un projet
const deleteProject = async (id) => {
  await pool.query('DELETE FROM projects WHERE id=$1', [id]);
};

const getProjectById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id=$1', [id]);
  return rows[0];
};

module.exports = { 
  getAllProjects, 
  getProjectsByOwnerId,
  createProject, 
  addCustomField,
  getCustomFields, // <- Ajouté pour le front
  updateProject, 
  deleteProject, 
  getProjectById,
  addCustomField,
  getCustomFields,
  updateCustomField,
  deleteCustomField
};

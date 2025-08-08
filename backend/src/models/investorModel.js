const pool = require('../utils/db');

const createInvestor = async ({ name, company, email, phone, notes }) => {
  const { rows } = await pool.query(
    `INSERT INTO investors (name, company, email, phone, notes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, company, email, phone, notes]
  );
  return rows[0];
};

const listInvestors = async () => {
  const { rows } = await pool.query(`SELECT * FROM investors ORDER BY name`);
  return rows;
};

const getInvestor = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM investors WHERE id=$1`, [id]);
  return rows[0];
};

const updateInvestor = async (id, payload) => {
  const { name, company, email, phone, notes } = payload;
  const { rows } = await pool.query(
    `UPDATE investors SET name=$1, company=$2, email=$3, phone=$4, notes=$5
     WHERE id=$6 RETURNING *`,
    [name, company, email, phone, notes, id]
  );
  return rows[0];
};

const deleteInvestor = async (id) => {
  await pool.query(`DELETE FROM investors WHERE id=$1`, [id]);
};

const attachInvestorToProject = async ({ project_id, investor_id, role=null }) => {
  const { rows } = await pool.query(
    `INSERT INTO project_investors (project_id, investor_id, role)
     VALUES ($1,$2,$3)
     ON CONFLICT (project_id, investor_id) DO UPDATE SET role=EXCLUDED.role
     RETURNING *`,
    [project_id, investor_id, role]
  );
  return rows[0];
};

const detachInvestorFromProject = async ({ project_id, investor_id }) => {
  await pool.query(
    `DELETE FROM project_investors WHERE project_id=$1 AND investor_id=$2`,
    [project_id, investor_id]
  );
};

const listProjectInvestors = async (project_id) => {
  const { rows } = await pool.query(
    `SELECT pi.id as link_id, i.*, pi.role
     FROM project_investors pi
     JOIN investors i ON i.id = pi.investor_id
     WHERE pi.project_id = $1
     ORDER BY i.name`,
    [project_id]
  );
  return rows;
};

module.exports = {
  createInvestor, listInvestors, getInvestor, updateInvestor, deleteInvestor,
  attachInvestorToProject, detachInvestorFromProject, listProjectInvestors
};

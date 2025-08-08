const pool = require('../utils/db');

const addStep = async (project_id, label, step_date, step_comment, status) => {
  const { rows } = await pool.query(
    'INSERT INTO project_steps (project_id, label, step_date, step_comment, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [project_id, label, step_date, step_comment, status]
  );
  return rows[0];
};

const getSteps = async (project_id) => {
  const { rows } = await pool.query(
    'SELECT * FROM project_steps WHERE project_id = $1 ORDER BY step_date DESC',
    [project_id]
  );
  return rows;
};
const deleteStep = async (stepId) => {
  await pool.query('DELETE FROM project_steps WHERE id = $1', [stepId]);
};
module.exports = { addStep, getSteps, deleteStep };

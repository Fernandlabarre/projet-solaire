const express = require('express');
const pool = require('../utils/db');
const router = express.Router();

router.get('/projects/:token', async (req, res) => {
  const { token } = req.params;
  const { rows } = await pool.query(
    `SELECT p.*, i.token, i.expires_at
    FROM projects p
    JOIN invitations i ON p.id = i.project_id
    WHERE i.token = $1 AND i.expires_at > NOW()`, [token]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Lien expiré ou invalide' });
  const project = rows[0];
  const { rows: steps } = await pool.query(
    'SELECT * FROM project_steps WHERE project_id = $1 ORDER BY step_date DESC',
    [project.id]
  );
  const { rows: custom_fields } = await pool.query(
    'SELECT * FROM project_custom_fields WHERE project_id = $1',
    [project.id]
  );
  res.json({
    ...project,
    steps,
    custom_fields,
  });
});

module.exports = router;

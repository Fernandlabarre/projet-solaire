const pool = require('../utils/db');
const crypto = require('crypto');

const createInvitation = async (project_id, email) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 jours
  const { rows } = await pool.query(
    'INSERT INTO invitations (project_id, email, token, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [project_id, email, token, expires_at]
  );
  return rows[0];
};

const getInvitation = async (token) => {
  const { rows } = await pool.query('SELECT * FROM invitations WHERE token = $1', [token]);
  return rows[0];
};

module.exports = { createInvitation, getInvitation };

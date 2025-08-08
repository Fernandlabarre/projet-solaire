const pool = require('../utils/db');

const getUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

const createUser = async (name, email, hash, role = 'user') => {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hash, role]
  );
  return rows[0];
};
const getAllUsers = async () => {
  const { rows } = await pool.query('SELECT id, name, email, role FROM users');
  return rows;
};

module.exports = { getUserByEmail, createUser, getAllUsers  };

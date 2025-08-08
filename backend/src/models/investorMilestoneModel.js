const pool = require('../utils/db');

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ALLOWED_STATUS = new Set(['Payé', 'Pas payé', 'Annulé', 'En cours']);

function buildUpdateSet(data) {
  // on autorise label, due_date, status, comment
  const allowed = ['label', 'due_date', 'status', 'comment'];
  const fields = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      fields[k] = data[k] === '' ? null : data[k];
    }
  }
  const keys = Object.keys(fields);
  if (!keys.length) return { sql: '', values: [] };

  const sets = [];
  const values = [];
  let i = 1;
  for (const k of keys) {
    sets.push(`${k} = $${i++}`);
    values.push(fields[k]);
  }
  // updated_at si ta table l’a
  sets.push(`updated_at = NOW()`);
  return { sql: sets.join(', '), values };
}

// ─── Create ────────────────────────────────────────────────────────────────────
// INSERT : retourne la ligne créée (pour MAJ instantanée côté front)
const addMilestone = async (project_id, investor_id, { label, due_date, status, comment }) => {
  if (status && !ALLOWED_STATUS.has(status)) {
    const err = new Error('Statut de jalon invalide');
    err.code = 'BAD_STATUS';
    throw err;
  }

  const { rows } = await pool.query(
    `INSERT INTO investor_milestones (project_id, investor_id, label, due_date, status, comment)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [project_id, investor_id, label, due_date || null, status, comment || null]
  );
  return rows[0];
};

// ─── Read ──────────────────────────────────────────────────────────────────────
const listMilestones = async (project_id, investor_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM investor_milestones
     WHERE project_id = $1 AND investor_id = $2
     ORDER BY COALESCE(due_date, created_at) DESC, id DESC`,
    [project_id, investor_id]
  );
  return rows;
};

const getMilestoneById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM investor_milestones WHERE id = $1`, [id]);
  return rows[0] || null;
};

// ─── Update ────────────────────────────────────────────────────────────────────
// Update "scopé" (sécurité: vérifie l’appartenance au projet & investisseur)
const updateMilestoneScoped = async (project_id, investor_id, id, data) => {
  if (data.status && !ALLOWED_STATUS.has(data.status)) {
    const err = new Error('Statut de jalon invalide');
    err.code = 'BAD_STATUS';
    throw err;
  }

  const { sql, values } = buildUpdateSet(data);
  if (!sql) {
    // rien à mettre à jour -> renvoyer la ligne courante
    const cur = await getMilestoneById(id);
    return cur;
  }

  const params = [...values, id, project_id, investor_id];
  const { rows } = await pool.query(
    `UPDATE investor_milestones
     SET ${sql}
     WHERE id = $${values.length + 1} AND project_id = $${values.length + 2} AND investor_id = $${values.length + 3}
     RETURNING *`,
    params
  );
  return rows[0] || null;
};

// Update par id (route "flat")
const updateMilestoneById = async (id, data) => {
  if (data.status && !ALLOWED_STATUS.has(data.status)) {
    const err = new Error('Statut de jalon invalide');
    err.code = 'BAD_STATUS';
    throw err;
  }

  const { sql, values } = buildUpdateSet(data);
  if (!sql) {
    const cur = await getMilestoneById(id);
    return cur;
  }

  const params = [...values, id];
  const { rows } = await pool.query(
    `UPDATE investor_milestones
     SET ${sql}
     WHERE id = $${values.length + 1}
     RETURNING *`,
    params
  );
  return rows[0] || null;
};

// ─── Delete ────────────────────────────────────────────────────────────────────
const deleteMilestone = async (id) => {
  await pool.query('DELETE FROM investor_milestones WHERE id = $1', [id]);
};

module.exports = {
  addMilestone,
  listMilestones,
  getMilestoneById,
  updateMilestoneScoped,
  updateMilestoneById,
  deleteMilestone
};

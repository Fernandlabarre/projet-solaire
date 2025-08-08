// backend/src/routes/investorRoutes.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const pool = require('../utils/db');

// ⚠️ Assure-toi d'avoir mis à jour le model comme je t'ai donné (+update)
const {
  addMilestone,
  listMilestones,
  deleteMilestone,
  updateMilestoneScoped,
  updateMilestoneById,
} = require('../models/investorMilestoneModel');

const router = express.Router();

/**
 * NOTE : ce fichier suppose que tu as déjà :
 * - table investors (id, name, company, email, phone, notes, ...)
 * - table project_investors (project_id, investor_id, role, unique)
 * - table investor_milestones (id, project_id, investor_id, label, due_date, status, comment, created_at, updated_at)
 * - type ENUM milestone_status qui contient EXACTEMENT :
 *   'Payé', 'Pas payé', 'Annulé', 'En cours'
 */

// ---------------- Investors master ----------------
router.get('/investors', authenticate, async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM investors ORDER BY name ASC');
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/investors', authenticate, async (req, res, next) => {
  try {
    const { name, company, email, phone, notes } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO investors (name, company, email, phone, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, company || null, email || null, phone || null, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// ---------------- Link / Unlink investor ↔ project ----------------
router.get('/projects/:project_id/investors', authenticate, async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { rows } = await pool.query(
      `SELECT i.*, pi.role
         FROM project_investors pi
         JOIN investors i ON i.id = pi.investor_id
        WHERE pi.project_id = $1
        ORDER BY i.name ASC`,
      [project_id]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/projects/:project_id/investors', authenticate, async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { investor_id, role } = req.body;
    await pool.query(
      `INSERT INTO project_investors (project_id, investor_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, investor_id) DO UPDATE SET role = EXCLUDED.role`,
      [project_id, investor_id, role || null]
    );
    res.status(201).json({ success: true });
  } catch (e) { next(e); }
});

router.delete('/projects/:project_id/investors/:investor_id', authenticate, async (req, res, next) => {
  try {
    const { project_id, investor_id } = req.params;
    await pool.query(
      `DELETE FROM project_investors WHERE project_id = $1 AND investor_id = $2`,
      [project_id, investor_id]
    );
    res.json({ success: true });
  } catch (e) { next(e); }
});

// ---------------- Milestones (investor-specific) ----------------

// LIST
router.get('/projects/:project_id/investors/:investor_id/milestones', authenticate, async (req, res, next) => {
  try {
    const { project_id, investor_id } = req.params;
    const rows = await listMilestones(project_id, investor_id);
    res.json(rows);
  } catch (e) { next(e); }
});

// CREATE
router.post('/projects/:project_id/investors/:investor_id/milestones', authenticate, async (req, res, next) => {
  try {
    const { project_id, investor_id } = req.params;
    // Les libellés FR exacts ("Payé", "Pas payé", ...) doivent être envoyés par le front.
    const created = await addMilestone(project_id, investor_id, req.body || {});
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// UPDATE (nested) — accepte PUT et PATCH
router.put('/projects/:project_id/investors/:investor_id/milestones/:id', authenticate, async (req, res, next) => {
  try {
    const { project_id, investor_id, id } = req.params;
    const updated = await updateMilestoneScoped(project_id, investor_id, id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Jalon introuvable' });
    res.json(updated);
  } catch (e) { next(e); }
});

router.patch('/projects/:project_id/investors/:investor_id/milestones/:id', authenticate, async (req, res, next) => {
  try {
    const { project_id, investor_id, id } = req.params;
    const updated = await updateMilestoneScoped(project_id, investor_id, id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Jalon introuvable' });
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE
router.delete('/projects/:project_id/investors/:investor_id/milestones/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteMilestone(id);
    res.json({ success: true });
  } catch (e) { next(e); }
});

// ---------------- Milestones (flat fallback) ----------------
// Permet au front de faire PUT/PATCH /api/milestones/:id si la route nested n'existe pas sur certaines envs

router.put('/milestones/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await updateMilestoneById(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Jalon introuvable' });
    res.json(updated);
  } catch (e) { next(e); }
});

router.patch('/milestones/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await updateMilestoneById(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Jalon introuvable' });
    res.json(updated);
  } catch (e) { next(e); }
});

router.get('/milestones/overdue', authenticate, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*, p.name AS project_name, i.name AS investor_name
      FROM investor_milestones m
      JOIN projects p ON p.id = m.project_id
      LEFT JOIN investors i ON i.id = m.investor_id
      WHERE m.due_date IS NOT NULL
        AND m.due_date::date < CURRENT_DATE
        AND (m.status IS NULL OR m.status NOT IN ('Payé','Annulé'))
      ORDER BY m.due_date ASC, m.id ASC
      LIMIT 100
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// --- DASHBOARD: Jalons à venir ---
router.get('/milestones/upcoming', authenticate, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*, p.name AS project_name, i.name AS investor_name
      FROM investor_milestones m
      JOIN projects p ON p.id = m.project_id
      LEFT JOIN investors i ON i.id = m.investor_id
      WHERE m.due_date IS NOT NULL
        AND m.due_date::date >= CURRENT_DATE
        AND m.status IN ('Pas payé', 'En cours')    -- exclut Payé / Annulé
      ORDER BY m.due_date ASC, m.id ASC
      LIMIT 100
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;

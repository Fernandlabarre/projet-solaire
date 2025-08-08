const pool = require("../utils/db");

// Jalons à venir
async function getUpcomingMilestones(req, res) {
  try {
    const today = new Date();

    const { rows } = await pool.query(`
      SELECT 
        m.id,
        m.label,
        m.due_date,
        m.status,
        p.id AS project_id,
        p.name AS project_name,
        i.name AS investor_name
      FROM investor_milestones m
      LEFT JOIN projects p ON p.id = m.project_id
      LEFT JOIN investors i ON i.id = m.investor_id
      WHERE m.due_date >= $1
      ORDER BY m.due_date ASC
      LIMIT 10
    `, [today]);

    res.json(rows);
  } catch (err) {
    console.error("Erreur getUpcomingMilestones:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des jalons à venir" });
  }
}

// Activité récente (projets modifiés récemment)
async function getRecentActivity(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT 
        'Mise à jour du projet "' || name || '"' AS text,
        updated_at AS date
      FROM projects
      ORDER BY updated_at DESC
      LIMIT 5
    `);

    res.json(rows);
  } catch (err) {
    console.error("Erreur getRecentActivity:", err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'activité récente" });
  }
}
async function getOverdueMilestones(req, res) {
  try {
    const query = `
      SELECT 
        m.id, 
        m.label, 
        m.due_date, 
        p.id AS project_id, 
        p.name AS project_name, 
        i.name AS investor_name
      FROM investor_milestones m
      JOIN projects p ON p.id = m.project_id
      LEFT JOIN investors i ON i.id = m.investor_id
      WHERE m.due_date < NOW()
      ORDER BY m.due_date ASC
      LIMIT 20;
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Erreur getOverdueMilestones:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des jalons en retard" });
  }
}
module.exports = {
  getUpcomingMilestones,
  getRecentActivity,
  getOverdueMilestones
};

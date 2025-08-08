const express = require('express');
const { authenticate } = require('../middleware/auth');
const projectModel = require('../models/projectModel');
const router = express.Router();

// Liste des projets
router.get('/', authenticate, async (req, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = await projectModel.getAllProjects();
  } else {
    projects = await projectModel.getProjectsByOwnerId(req.user.id);
  }
  res.json(projects);
});

// Créer un projet (admin seulement)
router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' });
  const project = await projectModel.createProject(req.body);
  res.json(project);
});

router.put('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' });
  const updated = await projectModel.updateProject(req.params.id, req.body);
  res.json(updated);
});

router.delete('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' });
  await projectModel.deleteProject(req.params.id);
  res.json({ success: true });
});

// --- Champs personnalisés (Custom Fields) ---

// Ajouter un champ personnalisé
router.post('/:id/custom_fields', authenticate, async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  if (isNaN(projectId)) return res.status(400).json({ error: 'Project id invalide' });
  const { field_name, field_value, user_id } = req.body;
  try {
    const newField = await projectModel.addCustomField(projectId, field_name, field_value, user_id);
    res.status(201).json(newField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les champs personnalisés
router.get('/:id/custom_fields', authenticate, async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  if (isNaN(projectId)) return res.status(400).json({ error: 'Project id invalide' });
  try {
    const fields = await projectModel.getCustomFields(projectId);
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier un champ personnalisé
router.put('/custom_fields/:field_id', authenticate, async (req, res) => {
  const fieldId = parseInt(req.params.field_id, 10);
  if (isNaN(fieldId)) return res.status(400).json({ error: 'Field id invalide' });
  const { field_name, field_value } = req.body;
  try {
    const updated = await projectModel.updateCustomField(fieldId, field_name, field_value);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un champ personnalisé
router.delete('/custom_fields/:field_id', authenticate, async (req, res) => {
  const fieldId = parseInt(req.params.field_id, 10);
  if (isNaN(fieldId)) return res.status(400).json({ error: 'Field id invalide' });
  try {
    await projectModel.deleteCustomField(fieldId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Détail d'un projet par ID ---
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const project = await projectModel.getProjectById(id);
  if (!project) return res.status(404).json({ error: 'Projet non trouvé' });

  if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  res.json(project);
});

module.exports = router;

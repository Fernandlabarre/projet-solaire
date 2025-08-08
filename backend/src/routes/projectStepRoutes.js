const express = require('express');
const { authenticate } = require('../middleware/auth');
const { addStep, getSteps, deleteStep } = require('../models/projectStepModel');
const router = express.Router();
const pool    = require('../utils/db');         // ← c’est ça qui manquait

router.post('/:project_id/steps', authenticate, async (req, res) => {
  const { label, step_date, step_comment, status } = req.body;
  const step = await addStep(req.params.project_id, label, step_date, step_comment, status);
  res.json(step);
});

// Récupérer les étapes
router.get('/:project_id/steps', authenticate, async (req, res) => {
  const steps = await getSteps(req.params.project_id);
  res.json(steps);
});
// Route pour supprimer une étape
router.delete('/:project_id/steps/:step_id', authenticate, async (req, res) => {
  try {
    const { project_id, step_id } = req.params;
    await deleteStep(step_id); // Assurez-vous que cette fonction est définie dans votre modèle
    res.status(200).send({ message: 'Étape supprimée avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étape:", error);
    res.status(500).send({ message: 'Erreur lors de la suppression de l\'étape' });
  }
});

module.exports = router;

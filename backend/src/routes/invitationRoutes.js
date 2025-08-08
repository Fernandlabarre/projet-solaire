const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createInvitation } = require('../models/invitationModel');
const nodemailer = require('nodemailer');
const router = express.Router();
const pool    = require('../utils/db');         // ← c’est ça qui manquait

router.post('/:project_id/invite', authenticate, async (req, res) => {
  const { email } = req.body;
  const invitation = await createInvitation(req.params.project_id, email);

  // Envoi email
  const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


  const url = `https://projets.domsolaire.fr/public/suivi/${invitation.token}`;
  await transporter.sendMail({
  from: `"Projet Solaire" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: 'Lien de suivi projet solaire',
  text: `Bonjour !\n\nVoici le lien de suivi de votre projet : ${url}\n\nCe lien expirera le ${invitation.expires_at.toLocaleString()}`,
  html: `<p>Bonjour !<br><br>Voici le lien de suivi de votre projet : <a href="${url}">${url}</a><br><br>Ce lien expirera le <b>${invitation.expires_at.toLocaleString()}</b></p>`
});


  res.json({ message: 'Invitation envoyée', url });
});

module.exports = router;

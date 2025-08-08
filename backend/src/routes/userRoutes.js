const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser } = require('../models/userModel');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const { getAllUsers } = require('../models/userModel'); // ajoute ce require en haut

// Inscription
// Inscription (admin only via API, ou public via front login)
router.post('/register', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' });
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await createUser(name, email, hash, 'user');
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'Email déjà utilisé' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
    console.log('BODY:', req.body); // AJOUTE CETTE LIGNE !

  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Exemple route protégée
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});
// Nouvelle route : Liste tous les utilisateurs (admin only)
router.get('/', authenticate, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' });
  getAllUsers()
    .then(users => res.json(users))
    .catch(next);
});
module.exports = router;

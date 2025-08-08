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
  console.log('BODY:', req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // 1) Récupère l’utilisateur en base
    const user = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    ).then(r => r.rows[0]);

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // 2) Compare le mot de passe
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // 3) Tout est OK → génère un token, etc.
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    // **Affiche la stack complète**
    console.error('💥 Erreur dans /api/users/login:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
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

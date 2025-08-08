const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

// === Journalisation dans un fichier backend/logs/debug.log ===
function logToFile(message) {
  const logDir = path.join(__dirname, '..', 'logs');
  const logFile = path.join(logDir, 'debug.log');
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
  } catch (e) {
    // On ignore les erreurs de log (ne doit pas bloquer l'app)
  }
}
// Log de démarrage
logToFile('==== BACKEND SOLAR APP DEMARRÉ ====');

const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const publicRoutes = require('./routes/publicRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const projectStepRoutes = require('./routes/projectStepRoutes');
const investorRoutes = require('./routes/investorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const app = express();
app.use(cors());
app.use(express.json());

// Log à chaque requête reçue
app.use((req, res, next) => {
  logToFile(`Reçu: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/projects', invitationRoutes);
app.use('/api/projects', projectStepRoutes);
app.use('/api', investorRoutes); // une seule base /api pour ce module
app.use("/api", dashboardRoutes);

// Route de test pour le ping
app.get('/api/ping', (req, res) => {
  logToFile('/api/ping appelé');
  res.json({ pong: true, now: new Date().toISOString() });
});

// Page d'accueil
app.get('/', (req, res) => {
  logToFile('Route / appelée');
  res.send('API Project Solar ready!');
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  logToFile('Erreur serveur: ' + err.stack);
  res.status(500).json({ error: 'Erreur serveur : ' + err.message });
});

// Catch global des exceptions fatales (process)
process.on('uncaughtException', err => {
  logToFile('Uncaught Exception: ' + err.stack);
});
process.on('unhandledRejection', reason => {
  logToFile('Unhandled Rejection: ' + reason);
});

const PORT = process.env.PORT || 'passenger';
app.listen(PORT, () => {
  const msg = `Backend running on port ${PORT}`;
  console.log(msg);
  logToFile(msg);
});

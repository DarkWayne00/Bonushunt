// 📁 sessionController.js
// Contrôleur de sessions "Bonus Hunt" en mémoire

// Structure de stockage :
// {
//   "user1@example.com": {
//     "LundiLucky": [ { machine: "X", investi: 10, gains: 50, multiplicateur: 5 }, ... ],
//     ...
//   },
//   ...
// }
const sessionsStore = {};

// Renvoie toutes les sessions de l'utilisateur connecté
exports.list = (req, res) => {
  const email = req.user.email;
  const userSessions = sessionsStore[email] || {};
  res.json(userSessions);
};

// Renvoie une seule session par nom
exports.getOne = (req, res) => {
  const email = req.user.email;
  const { sessionName } = req.params;
  const userSessions = sessionsStore[email] || {};
  const session = userSessions[sessionName];
  if (!session) {
    return res.status(404).json({ error: 'Session non trouvée' });
  }
  res.json({ [sessionName]: session });
};

// Crée une nouvelle session vide
exports.create = (req, res) => {
  const email = req.user.email;
  const { sessionName } = req.body;
  if (!sessionName) {
    return res.status(400).json({ error: 'Le nom de session est requis' });
  }
  sessionsStore[email] = sessionsStore[email] || {};
  if (sessionsStore[email][sessionName]) {
    return res.status(409).json({ error: 'Session déjà existante' });
  }
  sessionsStore[email][sessionName] = [];
  res.status(201).json({ sessionName });
};

// Ajoute un bonus à une session existante
exports.addBonus = (req, res) => {
  const email = req.user.email;
  const { sessionName } = req.params;
  const bonus = req.body;

  if (!bonus || typeof bonus !== 'object') {
    return res.status(400).json({ error: 'Bonus invalide' });
  }

  sessionsStore[email] = sessionsStore[email] || {};
  const userSessions = sessionsStore[email];

  if (!userSessions[sessionName]) {
    return res.status(404).json({ error: 'Session non trouvée' });
  }

  userSessions[sessionName].push(bonus);
  res.json(userSessions);
};

// Supprime un bonus par index dans une session
exports.deleteBonus = (req, res) => {
  const email = req.user.email;
  const { sessionName, idx } = req.params;
  const index = parseInt(idx, 10);

  if (isNaN(index)) {
    return res.status(400).json({ error: 'Index invalide' });
  }

  sessionsStore[email] = sessionsStore[email] || {};
  const userSessions = sessionsStore[email];
  const list = userSessions[sessionName];

  if (!list || index < 0 || index >= list.length) {
    return res.status(404).json({ error: 'Bonus non trouvé' });
  }

  list.splice(index, 1);
  // Si plus de bonus, on peut supprimer la session
  if (list.length === 0) {
    delete userSessions[sessionName];
  }

  res.json(userSessions);
};

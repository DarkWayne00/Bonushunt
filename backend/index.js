// 📁 backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { sendMagicLink, validateToken } = require("./controllers/authController");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✉️ Route pour envoyer le lien magique par e-mail
app.post("/login", sendMagicLink);

// 🔐 Route pour valider le lien magique
app.post("/validate", validateToken);

// 📁 Chemin vers le fichier d'utilisateurs
const USERS_FILE = path.join(__dirname, "data", "users.json");

// ✅ Crée le fichier users.json vide s’il n’existe pas
if (!fs.existsSync(USERS_FILE)) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, "{}");
}

// 👤 Récupérer tous les utilisateurs
app.get("/users", (req, res) => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users = JSON.parse(data || "{}");
    res.json({ users: Object.keys(users) });
  } catch (err) {
    console.error("❌ Erreur chargement des utilisateurs :", err);
    res.status(500).json({ error: "Erreur lors de la lecture des utilisateurs" });
  }
});

// ❌ Supprimer un utilisateur par son email
app.delete("/users/:email", (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8") || "{}");

    if (!users[email]) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    delete users[email];
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur suppression utilisateur :", err);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// 🔛 Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

// 📁 backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sendMagicLink, validateToken } = require("./controllers/authController");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✉️ Route pour envoyer le lien magique par e-mail
app.post("/login", sendMagicLink);

// 🔐 Route pour valider le lien magique
app.post("/validate", validateToken);

// 🔛 Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

// 📁 controllers/authController.js
const fs = require("fs");
const path = require("path");
const {
  generateToken,
  storeToken,
  isValidToken,
  getEmailFromToken,
  generateSessionToken
} = require("../utils/token");
const { sendLoginEmail } = require("../utils/email");

// 📁 Chemin du fichier utilisateurs
const usersFile = path.join(__dirname, "../data/users.json");

// ✉️ Envoie du lien magique par email
const sendMagicLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email requis" });
  }

  const token = generateToken();
  storeToken(email, token);

  const link = `${process.env.FRONT_URL}/validate.html?token=${token}`;
  await sendLoginEmail(email, link);

  res.json({ success: true, message: "Lien magique envoyé à votre adresse." });
};

// 🔐 Validation du lien magique
const validateToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token manquant" });
  }

  const email = getEmailFromToken(token);
  if (!email || !isValidToken(email, token)) {
    return res.status(401).json({ success: false, message: "Lien invalide ou expiré" });
  }

  const sessionToken = generateSessionToken(email);

  // ✅ Enregistrer l'email dans users.json sous forme d'objet
  try {
    let users = {};
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, "utf8");
      users = JSON.parse(data || "{}");
    }

    // Ajoute l’utilisateur s’il n’existe pas déjà
    if (!users[email]) {
      users[email] = { verified: true };
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement de l'utilisateur:", err);
  }

  res.json({ success: true, sessionToken, email });
};

module.exports = {
  sendMagicLink,
  validateToken
};

// 📁 utils/email.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.error("❌ Clé RESEND_API_KEY manquante dans .env");
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendLoginEmail(email, loginLink) {
  try {
    const htmlPath = path.join(__dirname, "..", "assets", "email.html");
    let html = fs.readFileSync(htmlPath, "utf8");

    // Injecte dynamiquement le lien de connexion
    html = html.replace(/{{LOGIN_LINK}}/g, loginLink);

    const response = await resend.emails.send({
      from: "Bonus Hunt <onboarding@resend.dev>",
      to: email,
      subject: "🎰 Connexion à Bonus Hunt",
      html,
    });

    console.log("✅ Email envoyé à", email);
    console.log("📨 Réponse Resend :", response);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du mail :", err);
  }
}

module.exports = { sendLoginEmail };

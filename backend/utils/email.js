// 📁 utils/email.js
require("dotenv").config();
const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.error("❌ Clé RESEND_API_KEY manquante dans .env");
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendLoginEmail(email, link) {
  try {
    const response = await resend.emails.send({
      from: "Bonus Hunt <onboarding@resend.dev>",
      to: email,
      subject: "🎰 Connexion à Bonus Hunt",
      html: `
        <div style="font-family:sans-serif; background:#111; color:white; padding:30px; border-radius:8px;">
          <h1>🔐 Connexion sécurisée</h1>
          <p>Clique sur le bouton ci-dessous pour te connecter à ton compte Bonus Hunt :</p>
          <a href="${link}" style="background:#28a745; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; display:inline-block; margin-top:20px;">
            🔗 Se connecter
          </a>
          <p style="margin-top:30px; font-size:13px;">Ce lien expirera dans 10 minutes.</p>
        </div>
      `
    });

    console.log("✅ Email envoyé à", email);
    console.log("📨 Réponse Resend :", response);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du mail :", err);
  }
}

module.exports = { sendLoginEmail };

// server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const port = 3001;

// 🔧 Middlewares
app.use(cors());
app.use(express.json());

// 📬 Configuration Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 📩 Endpoint pour envoyer le code de vérification
app.post("/send-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Email ou code manquant" });
  }

  try {
    const data = await resend.emails.send({
      from: "Bonus Hunt <onboarding@resend.dev>", // Tu peux personnaliser
      to: email,
      subject: "🎉 Votre code de vérification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #28a745;">Bienvenue sur Bonus Hunt 👋</h2>
          <p>Voici votre code de vérification :</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">${code}</div>
          <p>Ce code est valable pendant 5 minutes.</p>
          <hr />
          <small>Si vous n'avez pas demandé ce code, ignorez simplement cet email.</small>
        </div>
      `,
    });

    res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error("❌ Erreur d'envoi d'email :", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🚀 Lancement du serveur
app.listen(port, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${port}`);
});

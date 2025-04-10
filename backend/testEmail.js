// testEmail.js
require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function run() {
  try {
    const result = await resend.emails.send({
      from: "Bonus Hunt <onboarding@resend.dev>", // ou juste "onboarding@resend.dev"
      to: "gabtniamor12@gmail.com", // ✅ METS TON VRAI EMAIL ICI
      subject: "✅ Test direct depuis Resend",
      html: "<h1>Hello 👋</h1><p>Ceci est un test Resend direct.</p>"
    });

    console.log("✅ Mail envoyé avec succès !");
    console.log(result);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi :", err);
  }
}

run();

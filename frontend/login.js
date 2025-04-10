// 📁 frontend/login.js

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();
  const successMsg = document.getElementById("successMsg");
  const errorMsg = document.getElementById("errorMsg");
  const loader = document.getElementById("loader");

  successMsg.classList.add("hidden");
  errorMsg.classList.add("hidden");
  loader.classList.remove("hidden");

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    loader.classList.add("hidden");

    if (response.ok) {
      successMsg.classList.remove("hidden");
      emailInput.value = "";
    } else {
      const resData = await response.json();
      errorMsg.textContent = resData.message || "Erreur lors de l'envoi.";
      errorMsg.classList.remove("hidden");
    }
  } catch (err) {
    loader.classList.add("hidden");
    errorMsg.textContent = "Erreur réseau. Vérifiez votre connexion.";
    errorMsg.classList.remove("hidden");
  }
});

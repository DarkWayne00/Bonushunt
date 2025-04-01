// admin.js

const correctPassword = "admin123"; // mot de passe temporaire
const storedAdmin = localStorage.getItem("adminAccess");

const authContainer = document.getElementById("authContainer");
const panelContainer = document.getElementById("panelContainer");
const errorMsg = document.getElementById("authError");
const passwordInput = document.getElementById("adminPassword");
const loginBtn = document.getElementById("adminLoginBtn");
const logoutBtn = document.getElementById("logoutAdminBtn");

// Cache le message d'erreur au chargement
errorMsg.style.display = "none";

// Vérification si l'utilisateur est déjà connecté
if (storedAdmin === "true") {
  authContainer.classList.add("hidden");
  panelContainer.classList.remove("hidden");
}

// Connexion admin
loginBtn.addEventListener("click", () => {
  const inputPassword = passwordInput.value;
  if (inputPassword === correctPassword) {
    localStorage.setItem("adminAccess", "true");
    authContainer.classList.add("hidden");
    panelContainer.classList.remove("hidden");
    errorMsg.style.display = "none";
  } else {
    errorMsg.style.display = "block";
  }
});

// Masquer erreur à la saisie
passwordInput.addEventListener("input", () => {
  errorMsg.style.display = "none";
});

// Déconnexion
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminAccess");
  location.reload();
});

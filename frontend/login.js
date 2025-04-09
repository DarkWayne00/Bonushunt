// login.js

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const toggle = document.getElementById("toggleMode");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const loader = document.getElementById("loader");
const errorMsg = document.getElementById("errorMsg");

const verifySection = document.getElementById("verifySection");
const verifyInput = document.getElementById("verifyCodeInput");
const verifyBtn = document.getElementById("verifyBtn");
const verifyError = document.getElementById("verifyError");
const verifyTimer = document.getElementById("verifyTimer");
const timerCountdown = document.getElementById("timerCountdown");
const resendCodeBtn = document.getElementById("resendCodeBtn");

let isSignup = false;
let tempEmail = "";
let countdownInterval = null;

// 🔄 Connexion <-> Inscription
toggle.addEventListener("click", () => {
  isSignup = !isSignup;
  formTitle.textContent = isSignup ? "Créer un compte" : "Connexion";
  submitBtn.textContent = isSignup ? "Créer un compte" : "Se connecter";
  toggle.innerHTML = isSignup
    ? "Déjà inscrit ? <span>Se connecter</span>"
    : "Pas encore inscrit ? <span>Créer un compte</span>";

  // Réinitialisation visuelle
  errorMsg.style.display = "none";
  verifyError.style.display = "none";
  verifySection.classList.add("hidden");
  form.classList.remove("hidden");
  clearInterval(countdownInterval);
});

// 📩 Soumission du formulaire
form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";
  loader.style.display = "block";

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return showError("Veuillez entrer une adresse email valide.");
  if (password.length < 4) return showError("Mot de passe trop court (min 4 caractères)");

  const users = JSON.parse(localStorage.getItem("users") || "{}");

  setTimeout(() => {
    if (isSignup) {
      if (users[email]) {
        if (users[email].verified) {
          return showError("Un compte existe déjà avec cet email.");
        } else {
          return showError("Un compte non vérifié existe déjà. Cliquez sur 'Se connecter' pour vérifier.");
        }
      }

      const code = generateCode();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      tempEmail = email;

      users[email] = {
        password,
        createdAt: Date.now(),
        verified: false,
        code,
        codeExpiresAt: expiresAt
      };

      localStorage.setItem("users", JSON.stringify(users));
      loader.style.display = "none";
      showVerifySection();
      startCountdown(expiresAt);

      sendVerificationCode(email, code);

    } else {
      if (!users[email]) {
        return showError("Aucun compte trouvé avec cet email.");
      }

      if (users[email].password !== password) {
        return showError("Mot de passe incorrect.");
      }

      if (!users[email].verified) {
        tempEmail = email;
        showError("Veuillez vérifier votre email avant de vous connecter.");
        showVerifySection();
        startCountdown(users[email].codeExpiresAt);
        return;
      }

      localStorage.setItem("userEmail", email);
      redirectToDashboard();
    }
  }, 1000);
});

// ✅ Vérification du code
verifyBtn.addEventListener("click", () => {
  const inputCode = verifyInput.value.trim();
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[tempEmail];

  if (!user || !user.code || !user.codeExpiresAt) {
    return showVerifyError("Une erreur est survenue.");
  }

  if (Date.now() > user.codeExpiresAt) {
    delete users[tempEmail];
    localStorage.setItem("users", JSON.stringify(users));
    showVerifyError("⏰ Le code a expiré. Veuillez vous réinscrire.");
    verifyTimer.classList.add("hidden");
    resendCodeBtn.classList.remove("hidden");
    clearInterval(countdownInterval);
    return;
  }

  if (inputCode !== user.code) {
    return showVerifyError("❌ Code incorrect.");
  }

  user.verified = true;
  delete user.code;
  delete user.codeExpiresAt;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("userEmail", tempEmail);
  redirectToDashboard();
});

// 🔁 Renvoyer un nouveau code
resendCodeBtn?.addEventListener("click", () => {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[tempEmail];
  if (!user) return;

  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  user.code = code;
  user.codeExpiresAt = expiresAt;
  localStorage.setItem("users", JSON.stringify(users));

  resendCodeBtn.classList.add("hidden");
  verifyError.style.display = "none";
  startCountdown(expiresAt);

  sendVerificationCode(tempEmail, code);
});

// 📤 Envoi du code avec fetch
function sendVerificationCode(email, code) {
  loader.style.display = "block";
  fetch("http://localhost:3001/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code })
  })
    .then(async res => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur d'envoi du code");
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        console.log("✅ Code de vérification envoyé :", data.id);
      } else {
        throw new Error(data.error || "L'envoi du mail a échoué");
      }
    })
    .catch(err => {
      console.error("❌ Erreur d'envoi du mail :", err);
      showError("Impossible d’envoyer le code. Vérifie ta connexion ou réessaie plus tard.");
    })
    .finally(() => {
      loader.style.display = "none";
    });
}

function showVerifySection() {
  form.classList.add("hidden");
  verifySection.classList.remove("hidden");
  verifyInput.value = "";
  verifyError.style.display = "none";
  resendCodeBtn.classList.add("hidden");
}

function showError(message) {
  loader.style.display = "none";
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
}

function showVerifyError(message) {
  verifyError.textContent = message;
  verifyError.style.display = "block";
}

function redirectToDashboard() {
  loader.style.display = "none";
  window.location.href = "dashboard.html";
}

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function startCountdown(expirationTime) {
  clearInterval(countdownInterval);
  verifyTimer.classList.remove("hidden");

  countdownInterval = setInterval(() => {
    const timeLeft = Math.max(0, expirationTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    timerCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      verifyTimer.classList.add("hidden");
      resendCodeBtn.classList.remove("hidden");
    }
  }, 1000);
}

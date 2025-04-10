// 📁 dashboard.js

// ✅ Protection : redirige si l'utilisateur n'est pas connecté
const sessionToken = localStorage.getItem("sessionToken");
const userEmail = localStorage.getItem("userEmail");
if (!sessionToken || !userEmail) {
  alert("Vous devez être connecté pour accéder au dashboard.");
  window.location.href = "login.html";
}

// ✅ Stockage des sessions par utilisateur
const key = `sessions_${userEmail}`;

// ✅ Références aux éléments du DOM
const userEmailDisplay = document.getElementById("userEmailDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const themeSwitch = document.getElementById("themeSwitch");
const htmlEl = document.documentElement;
const themeIcon = document.getElementById("theme-icon");
const form = document.getElementById("sessionForm");
const tableBody = document.getElementById("sessionTableBody");
const fournisseurSelect = document.getElementById("fournisseurSelect");
const machineSelect = document.getElementById("machineSelect");
const successMessage = document.getElementById("successMessage");
const searchInput = document.getElementById("searchInput");
const fournisseurFilter = document.getElementById("fournisseurFilter");

// ✅ Nouveaux éléments de résumé
const summaryInvesti = document.getElementById("summaryInvesti");
const summaryBonus = document.getElementById("summaryBonus");
const summaryBreakEven = document.getElementById("summaryBreakEven");

if (userEmailDisplay) userEmailDisplay.textContent = `Connecté : ${userEmail}`;
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
  });
}

function updateIcon(theme) {
  themeIcon.textContent = theme === "dark" ? "🌙" : "🌞";
}

if (localStorage.getItem("theme") === "dark") {
  htmlEl.setAttribute("data-theme", "dark");
  themeSwitch.checked = true;
  updateIcon("dark");
} else {
  updateIcon("light");
}

themeSwitch.addEventListener("change", () => {
  if (themeSwitch.checked) {
    htmlEl.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    updateIcon("dark");
  } else {
    htmlEl.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    updateIcon("light");
  }
});

function updateSummary(sessions) {
  const totalInvesti = sessions.reduce((acc, s) => acc + (s.investi || 0), 0);
  const totalBonus = sessions.length;
  const breakEven = totalBonus ? (totalInvesti / totalBonus).toFixed(2) : 0;

  summaryInvesti.textContent = `${totalInvesti.toFixed(2)} €`;
  summaryBonus.textContent = totalBonus;
  summaryBreakEven.textContent = `${breakEven} €`;
}

function loadFournisseursEtMachines() {
  const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
  fournisseurSelect.innerHTML = '<option value="" disabled selected>-- Choisir un fournisseur --</option>';
  fournisseurFilter.innerHTML = '<option value="">Tous les fournisseurs</option>';

  if (!fournisseurs.length) {
    fournisseurSelect.innerHTML += '<option value="" disabled>Aucun fournisseur disponible</option>';
    fournisseurFilter.innerHTML += '<option value="" disabled>Aucun fournisseur</option>';
    machineSelect.innerHTML = '<option value="" disabled>Aucune machine</option>';
    return;
  }

  fournisseurs.forEach((nom, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = nom;
    fournisseurSelect.appendChild(opt);

    const opt2 = document.createElement("option");
    opt2.value = nom;
    opt2.textContent = nom;
    fournisseurFilter.appendChild(opt2);
  });

  updateMachineOptions();
}

fournisseurSelect.addEventListener("change", updateMachineOptions);

function updateMachineOptions() {
  const index = fournisseurSelect.value;
  const machines = JSON.parse(localStorage.getItem(`machines_${index}`) || "[]");
  machineSelect.innerHTML = '<option value="" disabled selected>-- Choisir une machine --</option>';

  if (!machines.length) {
    machineSelect.innerHTML += '<option value="" disabled>Aucune machine</option>';
    return;
  }

  machines.forEach((nom) => {
    const opt = document.createElement("option");
    opt.value = nom;
    opt.textContent = nom;
    machineSelect.appendChild(opt);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const machine = machineSelect.value;
  const investi = parseFloat(document.getElementById("investi").value);
  const gains = parseFloat(document.getElementById("gains").value);
  const status = gains - investi;

  const newSession = { date, machines: machine, investi, gains, status };
  const sessions = JSON.parse(localStorage.getItem(key) || "[]");
  sessions.push(newSession);
  localStorage.setItem(key, JSON.stringify(sessions));
  displaySessions(sessions);
  form.reset();
  loadFournisseursEtMachines();
  showSuccessMessage();
  fournisseurSelect.focus();
});

function displaySessions(sessions) {
  sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
  tableBody.innerHTML = "";

  sessions.forEach((session, index) => {
    const statusClass = session.status >= 0 ? "status-gain" : "status-loss";
    const statusText = session.status >= 0 ? "+" + session.status : session.status;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${session.date}</td>
      <td>${session.machines}</td>
      <td>${session.investi}</td>
      <td>${session.gains}</td>
      <td class="${statusClass}">${statusText}</td>
      <td><button class="delete-btn">Supprimer</button></td>
    `;
    row.querySelector(".delete-btn").addEventListener("click", () => {
      const updated = JSON.parse(localStorage.getItem(key) || "[]");
      updated.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(updated));
      displaySessions(updated);
      filterSessions();
    });
    tableBody.appendChild(row);
  });

  updateChart(sessions);
  updateSummary(sessions);
}


function showSuccessMessage() {
  successMessage.style.display = "block";
  successMessage.style.opacity = "1";
  setTimeout(() => {
    successMessage.style.opacity = "0";
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 300);
  }, 1500);
}

function filterSessions() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedFournisseur = fournisseurFilter.value.toLowerCase();
  const allSessions = JSON.parse(localStorage.getItem(key) || "[]");

  const filtered = allSessions.filter((s) => {
    const machineMatch = s.machines.toLowerCase().includes(searchTerm);
    const fournisseurText = fournisseurSelect.options[fournisseurSelect.selectedIndex]?.textContent?.toLowerCase() || "";
    const fournisseurMatch = !selectedFournisseur || fournisseurText === selectedFournisseur;
    return machineMatch && fournisseurMatch;
  });

  displaySessions(filtered);
}

if (searchInput) {
  searchInput.addEventListener("input", filterSessions);
}
if (fournisseurFilter) {
  fournisseurFilter.addEventListener("change", filterSessions);
}

window.addEventListener("storage", (event) => {
  if (event.key === "fournisseurs" || event.key?.startsWith("machines_")) {
    loadFournisseursEtMachines();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadFournisseursEtMachines();
  const sessions = JSON.parse(localStorage.getItem(key) || "[]");
  displaySessions(sessions);
});

let statsChart = null;

function updateChart(sessions) {
  const labels = sessions.map(s => s.date);
  const invested = sessions.map(s => s.investi);
  const gains = sessions.map(s => s.gains);

  const ctx = document.getElementById("statsChart").getContext("2d");

  if (statsChart) statsChart.destroy();

  statsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Investi (€)",
          data: invested,
          backgroundColor: "#ff4d4d"
        },
        {
          label: "Gains (€)",
          data: gains,
          backgroundColor: "#28a745"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          }
        },
        y: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          },
          beginAtZero: true
        }
      }
    }
  });
}

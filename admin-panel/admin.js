// admin.js

const correctPassword = "admin123";
const storedAdmin = localStorage.getItem("adminAccess");

const authContainer = document.getElementById("authContainer");
const panelContainer = document.getElementById("panelContainer");
const errorMsg = document.getElementById("authError");
const passwordInput = document.getElementById("adminPassword");
const loginBtn = document.getElementById("adminLoginBtn");
const logoutBtn = document.getElementById("logoutAdminBtn");

const fournisseurForm = document.getElementById("fournisseurForm");
const fournisseurInput = document.getElementById("fournisseurInput");
const fournisseurList = document.getElementById("fournisseurList");
const fournisseurSearch = document.getElementById("fournisseurSearch");
const fournisseurSelect = document.getElementById("fournisseurSelect");

const machineForm = document.getElementById("machineForm");
const machineInput = document.getElementById("machineInput");
const machineList = document.getElementById("machineList");

const userSearchInput = document.createElement("input");
userSearchInput.type = "text";
userSearchInput.placeholder = "🔍 Rechercher un utilisateur";
userSearchInput.className = "search-machine";
userSearchInput.id = "userSearchInput";

let currentPage = 1;
const fournisseursPerPage = 10;

if (storedAdmin === "true") {
  authContainer.classList.add("hidden");
  panelContainer.classList.remove("hidden");
  mettreAJourCompteurs();
}

loginBtn.addEventListener("click", () => {
  const inputPassword = passwordInput.value;
  if (inputPassword === correctPassword) {
    localStorage.setItem("adminAccess", "true");
    authContainer.classList.add("hidden");
    panelContainer.classList.remove("hidden");
    errorMsg.style.display = "none";
    mettreAJourCompteurs();
    showNotification("Connexion réussie ✅");
  } else {
    errorMsg.style.display = "block";
    showNotification("Mot de passe incorrect ❌", "error");
  }
});


passwordInput.addEventListener("input", () => {
  errorMsg.style.display = "none";
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminAccess");
  location.reload();
});


// 👤 Gestion des utilisateurs
function afficherUtilisateurs() {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  const searchTerm = userSearchInput.value.toLowerCase();

  fetch("http://localhost:3000/users")
    .then((res) => res.json())
    .then((data) => {
      const users = data.users || [];
      const filtered = users.filter((email) => email.toLowerCase().includes(searchTerm));

      if (filtered.length === 0) {
        userList.innerHTML = "<li>Aucun utilisateur trouvé</li>";
        return;
      }

      filtered.forEach((email) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${email}</span>
          <button class="delete-user-btn" data-email="${email}" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
        `;
        li.querySelector(".delete-user-btn").addEventListener("click", () => supprimerUtilisateur(email));
        userList.appendChild(li);
      });
    })
    .catch(() => {
      userList.innerHTML = "<li>Erreur de chargement des utilisateurs</li>";
    });
}

function supprimerUtilisateur(email) {
  if (!confirm(`Supprimer l'utilisateur : ${email} ?`)) return;
  fetch("http://localhost:3000/users/" + encodeURIComponent(email), {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error();
      showNotification(`Utilisateur \"${email}\" supprimé ✅`);
      afficherUtilisateurs();
    })
    .catch(() => showNotification("Erreur lors de la suppression", "error"));
}


// Gérer l'affichage du panneau utilisateur
window.addEventListener("DOMContentLoaded", () => {
  afficherFournisseurs();
  mettreAJourCompteurs();

  document.getElementById("manageUsersBtn")?.addEventListener("click", () => {
    const modal = document.getElementById("userModal");
    const userList = document.getElementById("userList");
    if (!document.getElementById("userSearchInput")) {
      userList.parentElement.insertBefore(userSearchInput, userList);
      userSearchInput.addEventListener("input", afficherUtilisateurs);
    }
    afficherUtilisateurs();
    modal.classList.remove("hidden");
  });

  document.getElementById("closeUserModal")?.addEventListener("click", () => {
    document.getElementById("userModal").classList.add("hidden");
  });
});


fournisseurForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const nom = fournisseurInput.value.trim();
  if (!nom) return showNotification("Le nom du fournisseur est vide", "error");

  const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
  if (fournisseurs.includes(nom)) return showNotification("Ce fournisseur existe déjà", "error");

  fournisseurs.push(nom);
  localStorage.setItem("fournisseurs", JSON.stringify(fournisseurs));
  fournisseurInput.value = "";
  currentPage = 1;
  afficherFournisseurs();
  mettreAJourCompteurs();
  showNotification("Fournisseur ajouté avec succès ✅");
});



fournisseurSearch?.addEventListener("input", afficherFournisseurs);

function afficherFournisseurs() {
  const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
  const searchTerm = (fournisseurSearch?.value || "").toLowerCase();
  const filtered = fournisseurs.filter(nom => nom.toLowerCase().includes(searchTerm));

  const totalPages = Math.ceil(filtered.length / fournisseursPerPage);
  currentPage = Math.min(currentPage, totalPages || 1);

  const start = (currentPage - 1) * fournisseursPerPage;
  const current = filtered.slice(start, start + fournisseursPerPage);

  fournisseurList.innerHTML = "";
  current.forEach((nom, i) => {
    const globalIndex = fournisseurs.indexOf(nom);
    const li = document.createElement("li");
    li.classList.add("draggable-item");
    li.setAttribute("draggable", true);
    li.dataset.index = globalIndex;
    li.innerHTML = `
      <span class="drag-handle">☰</span>
      <span class="fournisseur-nom">${nom}</span>
      <div>
        <button class="btn btn-secondary edit-fournisseur" data-index="${globalIndex}" title="Modifier"><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger delete-fournisseur" data-index="${globalIndex}">Supprimer</button>
      </div>
    `;
    li.querySelector(".delete-fournisseur").addEventListener("click", () => supprimerFournisseur(globalIndex));
    li.querySelector(".edit-fournisseur").addEventListener("click", () => {
      const nouveauNom = prompt("Modifier le nom du fournisseur:", nom);
      if (nouveauNom && nouveauNom.trim() && nouveauNom !== nom) {
        const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
        if (fournisseurs.includes(nouveauNom.trim())) {
          return showNotification("Ce nom existe déjà.", "error");
        }
        fournisseurs[globalIndex] = nouveauNom.trim();
        localStorage.setItem("fournisseurs", JSON.stringify(fournisseurs));
        afficherFournisseurs();
        majDropdownFournisseurs();
        showNotification("Nom du fournisseur modifié ✅");
      }
    });
    fournisseurList.appendChild(li);
  });

  enableDragAndDrop(fournisseurList, "fournisseurs");
  afficherPagination(filtered.length);
  majDropdownFournisseurs();
  mettreAJourCompteurs();
}


function enableFournisseurDrag() {
  let dragged;

  fournisseurList.querySelectorAll("li").forEach(item => {
    item.addEventListener("dragstart", (e) => {
      dragged = item;
      item.classList.add("dragging");
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      const bounding = item.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;
      if (e.clientY - offset > 0) {
        item.style["border-bottom"] = "2px solid #28a745";
        item.style["border-top"] = "";
      } else {
        item.style["border-top"] = "2px solid #28a745";
        item.style["border-bottom"] = "";
      }
    });

    item.addEventListener("dragleave", () => {
      item.style["border-top"] = "";
      item.style["border-bottom"] = "";
    });

    item.addEventListener("drop", () => {
      item.style["border-top"] = "";
      item.style["border-bottom"] = "";
      if (dragged !== item) {
        const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
        const from = +dragged.dataset.index;
        const to = +item.dataset.index;
        const [moved] = fournisseurs.splice(from, 1);
        fournisseurs.splice(to, 0, moved);
        localStorage.setItem("fournisseurs", JSON.stringify(fournisseurs));
        afficherFournisseurs();
      }
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.index);
  e.target.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDropFournisseur(e) {
  e.preventDefault();
  const fromIndex = +e.dataTransfer.getData("text/plain");
  const toIndex = +e.target.closest("li").dataset.index;

  let fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
  const [moved] = fournisseurs.splice(fromIndex, 1);
  fournisseurs.splice(toIndex, 0, moved);

  localStorage.setItem("fournisseurs", JSON.stringify(fournisseurs));
  afficherFournisseurs();
  showNotification("Ordre des fournisseurs mis à jour");
}


function afficherPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / fournisseursPerPage);
  let pagination = document.getElementById("pagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination";
    fournisseurList.parentElement.appendChild(pagination);
  }
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      afficherFournisseurs();
    });
    pagination.appendChild(btn);
  }
}

function majDropdownFournisseurs() {
  const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]").sort((a, b) => a.localeCompare(b));
  const currentSelection = fournisseurSelect.value;
  fournisseurSelect.innerHTML = `<option value="">-- Choisir un fournisseur --</option>`;
  fournisseurs.forEach((nom, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = nom;
    fournisseurSelect.appendChild(option);
  });
  fournisseurSelect.value = currentSelection;
}

machineForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const index = fournisseurSelect.value;
  const nom = machineInput.value.trim();
  if (!nom || index === "") return showNotification("Veuillez remplir tous les champs", "error");

  const machines = JSON.parse(localStorage.getItem(`machines_${index}`) || "[]");
  if (machines.includes(nom)) return showNotification("Cette machine existe déjà", "error");

  machines.push(nom);
  machines.sort();
  localStorage.setItem(`machines_${index}`, JSON.stringify(machines));
  machineInput.value = "";
  afficherMachines(index);
  mettreAJourCompteurs();
  showNotification("Machine ajoutée avec succès ✅");
});

fournisseurSelect?.addEventListener("change", () => {
  afficherMachines(fournisseurSelect.value);
});

function afficherMachines(index) {
  if (index === "") return (machineList.innerHTML = "");

  const machines = JSON.parse(localStorage.getItem(`machines_${index}`) || "[]");
  machineList.innerHTML = "";
  machines.forEach((nom, i) => {
    const li = document.createElement("li");
    li.classList.add("draggable-item");
    li.setAttribute("draggable", true);
    li.setAttribute("data-index", i);
    li.innerHTML = `
      <span class="drag-handle">☰</span>
      <span>${nom}</span>
      <div>
        <button class="btn btn-secondary edit-machine" data-machine-index="${i}" data-fournisseur-index="${index}" title="Modifier"><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger delete-machine" data-machine-index="${i}" data-fournisseur-index="${index}">Supprimer</button>
      </div>
    `;
    li.querySelector(".delete-machine").addEventListener("click", () => supprimerMachine(index, i));
    li.querySelector(".edit-machine").addEventListener("click", () => {
      const nouveauNom = prompt("Modifier le nom de la machine:", nom);
      if (nouveauNom && nouveauNom.trim() && nouveauNom !== nom) {
        if (machines.includes(nouveauNom.trim())) {
          return showNotification("Ce nom existe déjà.", "error");
        }
        machines[i] = nouveauNom.trim();
        localStorage.setItem(`machines_${index}`, JSON.stringify(machines));
        afficherMachines(index);
        mettreAJourCompteurs();
        showNotification("Nom de la machine modifié ✅");
      }
    });
    machineList.appendChild(li);
  });

  enableDragAndDrop(machineList, `machines_${index}`);
  mettreAJourCompteurs();
}


function supprimerMachine(index, i) {
  const machines = JSON.parse(localStorage.getItem(`machines_${index}`) || "[]");
  const nom = machines[i];
  machines.splice(i, 1);
  localStorage.setItem(`machines_${index}`, JSON.stringify(machines));
  afficherMachines(index);
  mettreAJourCompteurs();
  showNotification(`Machine \"${nom}\" supprimée`, "success");
}

function supprimerFournisseur(index) {
  const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
  const nom = fournisseurs[index];
  fournisseurs.splice(index, 1);
  localStorage.setItem("fournisseurs", JSON.stringify(fournisseurs));
  localStorage.removeItem(`machines_${index}`);
  currentPage = 1;
  afficherFournisseurs();
  machineList.innerHTML = "";
  mettreAJourCompteurs();
  showNotification(`Fournisseur \"${nom}\" supprimé`, "success");
}

function mettreAJourCompteurs() {
  const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
  const machineTotal = fournisseurs.reduce((acc, _, i) => {
    const machines = JSON.parse(localStorage.getItem(`machines_${i}`) || "[]");
    return acc + machines.length;
  }, 0);

  const fournisseurCountEl = document.getElementById("totalFournisseurs") || document.getElementById("fournisseurCount");
  const machineCountEl = document.getElementById("totalMachines") || document.getElementById("machineCount");

  if (fournisseurCountEl) fournisseurCountEl.textContent = fournisseurs.length;
  if (machineCountEl) machineCountEl.textContent = machineTotal;
}




function enableDragAndDrop(list, storageKey) {
  let dragged;

  list.querySelectorAll(".draggable-item").forEach(item => {
    item.addEventListener("dragstart", (e) => {
      dragged = item;
      item.classList.add("dragging");
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      const bounding = item.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;
      if (e.clientY - offset > 0) {
        item.style["border-bottom"] = "2px solid #28a745";
        item.style["border-top"] = "";
      } else {
        item.style["border-top"] = "2px solid #28a745";
        item.style["border-bottom"] = "";
      }
    });

    item.addEventListener("dragleave", () => {
      item.style["border-top"] = "";
      item.style["border-bottom"] = "";
    });

    item.addEventListener("drop", () => {
      item.style["border-top"] = "";
      item.style["border-bottom"] = "";
      if (dragged !== item) {
        const listData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const from = +dragged.dataset.index;
        const to = +item.dataset.index;
        const [moved] = listData.splice(from, 1);
        listData.splice(to, 0, moved);
        localStorage.setItem(storageKey, JSON.stringify(listData));

        if (storageKey === "fournisseurs") afficherFournisseurs();
        else afficherMachines(storageKey.split("_")[1]);
      }
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });

    // 👇 Touch support (mobile)
    item.addEventListener("touchstart", (e) => {
      dragged = item;
      dragged.classList.add("dragging");
    });

    item.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!target || !target.closest(".draggable-item")) return;
      const dropTarget = target.closest(".draggable-item");
      if (dragged && dragged !== dropTarget) {
        const parent = dragged.parentNode;
        const from = +dragged.dataset.index;
        const to = +dropTarget.dataset.index;
        if (from !== to) {
          const listData = JSON.parse(localStorage.getItem(storageKey) || "[]");
          const [moved] = listData.splice(from, 1);
          listData.splice(to, 0, moved);
          localStorage.setItem(storageKey, JSON.stringify(listData));
          if (storageKey === "fournisseurs") afficherFournisseurs();
          else afficherMachines(storageKey.split("_")[1]);
        }
      }
    });

    item.addEventListener("touchend", () => {
      dragged?.classList.remove("dragging");
    });
  });
}
function showNotification(message, type = "success") {
  const notif = document.getElementById("notification");
  if (!notif) return;
  notif.textContent = message;
  notif.className = `notification ${type} show`;
  setTimeout(() => {
    notif.classList.remove("show");
    notif.classList.add("hidden");
  }, 3000);
}
// Export JSON

document.getElementById("exportBtn")?.addEventListener("click", () => {
  const fournisseurs = JSON.parse(localStorage.getItem("fournisseurs") || "[]");
  const data = { fournisseurs: fournisseurs, machines: {} };

  fournisseurs.forEach((_, index) => {
    const machines = JSON.parse(localStorage.getItem(`machines_${index}`) || "[]");
    data.machines[`machines_${index}`] = machines;
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bonus_hunt_data.json";
  link.click();
  URL.revokeObjectURL(url);

  showNotification("✅ Données exportées avec succès");
});

// Import JSON

document.getElementById("importBtn")?.addEventListener("click", () => {
  document.getElementById("importInput")?.click();
});

document.getElementById("importInput")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);

      if (!Array.isArray(data.fournisseurs) || typeof data.machines !== "object") {
        throw new Error("Format JSON invalide.");
      }

      localStorage.setItem("fournisseurs", JSON.stringify(data.fournisseurs));

      for (let i = 0; i < 100; i++) {
        if (localStorage.getItem(`machines_${i}`)) {
          localStorage.removeItem(`machines_${i}`);
        }
      }

      Object.entries(data.machines).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });

      showNotification("📂 Données importées avec succès !");
      window.location.reload();
    } catch (err) {
      showNotification("❌ Fichier invalide", "error");
      console.error(err);
    }
  };
  reader.readAsText(file);
});

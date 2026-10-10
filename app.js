// Datos iniciales de demostración basados en el caso práctico
const initialLoans = [
  {
    id: 1,
    studentName: "Carlos Mendoza Silva",
    equipment: "Laptop HP ProBook 450",
    date: "10/10/2026, 09:15 AM",
    returnDate: "2026-10-12",
    status: "Prestado"
  },
  {
    id: 2,
    studentName: "María Fernández Quispe",
    equipment: "Proyector Epson PowerLite XGA",
    date: "10/10/2026, 10:30 AM",
    returnDate: "2026-10-11",
    status: "Prestado"
  },
  {
    id: 3,
    studentName: "Alejandro Ruiz Torres",
    equipment: "Laptop Lenovo ThinkPad T14",
    date: "10/10/2026, 11:00 AM",
    returnDate: "2026-10-10",
    status: "Devuelto"
  }
];

// Obtener préstamos de localStorage o usar iniciales
function getLoans() {
  const stored = localStorage.getItem("sistema_prestamos_data");
  if (!stored) {
    localStorage.setItem("sistema_prestamos_data", JSON.stringify(initialLoans));
    return initialLoans;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialLoans;
  }
}

// Guardar préstamos en localStorage
function saveLoans(loans) {
  localStorage.setItem("sistema_prestamos_data", JSON.stringify(loans));
}

// Elementos del DOM
const loanForm = document.getElementById("loanForm");
const studentNameInput = document.getElementById("studentName");
const equipmentInput = document.getElementById("equipment");
const returnDateInput = document.getElementById("returnDate"); // NUEVO: fecha de devolución
const searchInput = document.getElementById("searchInput");
const loansTableBody = document.getElementById("loansTableBody");
const emptyState = document.getElementById("emptyState");

// Contadores
const totalLoansEl = document.getElementById("totalLoans");
const laptopCountEl = document.getElementById("laptopCount");
const projectorCountEl = document.getElementById("projectorCount");
const returnedCountEl = document.getElementById("returnedCount");

// NUEVO: obtener la fecha de hoy en formato YYYY-MM-DD
function getTodayISO() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// NUEVO: mostrar la fecha de devolución como DD/MM/YYYY
function formatReturnDate(isoDate) {
  if (!isoDate) return "Sin fecha";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// NUEVO: no permitir fechas de devolución anteriores a hoy
returnDateInput.min = getTodayISO();

// Notificación Toast
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";

  if (type === "success") {
    toast.style.backgroundColor = "#065f46";
  } else if (type === "danger") {
    toast.style.backgroundColor = "#991b1b";
  } else {
    toast.style.backgroundColor = "#1e293b";
  }

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// Actualizar contadores estadísticos
function updateStatistics(loans) {
  const total = loans.length;
  const laptops = loans.filter(l => l.equipment.toLowerCase().includes("laptop") && l.status === "Prestado").length;
  const projectors = loans.filter(l => l.equipment.toLowerCase().includes("proyector") && l.status === "Prestado").length;
  const returned = loans.filter(l => l.status === "Devuelto").length;

  totalLoansEl.textContent = total;
  laptopCountEl.textContent = laptops;
  projectorCountEl.textContent = projectors;
  returnedCountEl.textContent = returned;
}

// Renderizar la tabla de préstamos
function renderLoans(filterText = "") {
  const loans = getLoans();
  updateStatistics(loans);

  const filtered = loans.filter(loan => {
    const q = filterText.toLowerCase().trim();
    return (
      loan.studentName.toLowerCase().includes(q) ||
      loan.equipment.toLowerCase().includes(q) ||
      loan.status.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    loansTableBody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  loansTableBody.innerHTML = filtered.map((loan, index) => {
    const isReturned = loan.status === "Devuelto";
    const isLaptop = loan.equipment.toLowerCase().includes("laptop");
    const isProjector = loan.equipment.toLowerCase().includes("proyector");

    // NUEVO: el préstamo está vencido si no se devolvió y la fecha ya pasó
    const isOverdue = !isReturned && loan.returnDate && loan.returnDate < getTodayISO();

    let equipIconClass = "";
    if (isLaptop) equipIconClass = "equip-laptop";
    else if (isProjector) equipIconClass = "equip-projector";

    let badgeText = '⏳ Prestado';
    let badgeStyle = '';
    if (isReturned) {
      badgeText = '✓ Devuelto';
    } else if (isOverdue) {
      badgeText = '⚠ Vencido';
      badgeStyle = 'background-color: #fee2e2; color: #991b1b;';
    }

    return `
      <tr>
        <td><strong>#${index + 1}</strong></td>
        <td>
          <strong>${escapeHtml(loan.studentName)}</strong>
        </td>
        <td>
          <span class="equip-tag ${equipIconClass}">
            ${escapeHtml(loan.equipment)}
          </span>
        </td>
        <td style="color: var(--text-muted); font-size: 0.82rem;">
          ${loan.date}
        </td>
        <td style="font-size: 0.82rem; ${isOverdue ? 'color: #991b1b; font-weight: 600;' : ''}">
          ${formatReturnDate(loan.returnDate)}
        </td>
        <td>
          <span class="badge ${isReturned ? 'badge-returned' : 'badge-active'}" style="${badgeStyle}">
            ${badgeText}
          </span>
        </td>
        <td class="text-center">
          <div class="action-buttons">
            <button
              type="button"
              class="btn btn-sm ${isReturned ? 'btn-danger' : 'btn-success'}"
              onclick="toggleLoanStatus(${loan.id})"
              title="${isReturned ? 'Marcar como pendiente/prestado' : 'Marcar como entregado y devuelto'}"
            >
              ${isReturned ? 'Reabrir' : 'Devolver'}
            </button>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              onclick="deleteLoan(${loan.id})"
              title="Eliminar registro"
            >
              ✕
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Escapar texto contra inyecciones HTML simples
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Formatear fecha y hora actual
function getCurrentFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Formato 12 horas
  const strHours = String(hours).padStart(2, '0');
  return `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm}`;
}

// Manejar registro de nuevo préstamo
loanForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const studentName = studentNameInput.value.trim();
  const equipment = equipmentInput.value.trim();
  const returnDate = returnDateInput.value; // NUEVO

  if (!studentName || !equipment || !returnDate) {
    showToast("Por favor complete los campos obligatorios.", "danger");
    return;
  }

  // NUEVO: validar que la fecha de devolución no sea pasada
  if (returnDate < getTodayISO()) {
    showToast("La fecha de devolución no puede ser anterior a hoy.", "danger");
    return;
  }

  const loans = getLoans();
  const newLoan = {
    id: Date.now(),
    studentName: studentName,
    equipment: equipment,
    date: getCurrentFormattedDate(),
    returnDate: returnDate, // NUEVO
    status: "Prestado"
  };

  loans.unshift(newLoan);
  saveLoans(loans);

  // Limpiar formulario y re-renderizar
  studentNameInput.value = "";
  equipmentInput.value = "";
  returnDateInput.value = ""; // NUEVO
  studentNameInput.focus();

  renderLoans(searchInput.value);
  showToast(`Préstamo registrado exitosamente para ${studentName}`, "success");
});

// Cambiar estado de Préstamo (Prestado <-> Devuelto)
window.toggleLoanStatus = function (id) {
  const loans = getLoans();
  const loanIndex = loans.findIndex(l => l.id === id);

  if (loanIndex !== -1) {
    const isNowReturned = loans[loanIndex].status === "Prestado";
    loans[loanIndex].status = isNowReturned ? "Devuelto" : "Prestado";
    saveLoans(loans);
    renderLoans(searchInput.value);
    showToast(
      isNowReturned ? "Equipo marcado como devuelto." : "Préstamo reactivado.",
      isNowReturned ? "success" : "info"
    );
  }
};

// Eliminar préstamo
window.deleteLoan = function (id) {
  if (!confirm("¿Está seguro de que desea eliminar este registro?")) return;

  let loans = getLoans();
  loans = loans.filter(l => l.id !== id);
  saveLoans(loans);
  renderLoans(searchInput.value);
  showToast("Registro eliminado con éxito.", "danger");
};

// Buscador en tiempo real
searchInput.addEventListener("input", function (e) {
  renderLoans(e.target.value);
});

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  renderLoans();
});
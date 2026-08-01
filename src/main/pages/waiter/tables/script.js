import "/waiter/components/nav/script.js";
import "/waiter/components/menu-card.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import API_URL from "/scripts/config-api-url.js";

sessionStorage.removeItem("tableSessionId");
sessionStorage.removeItem("tableNumber");

const createTableBtn = document.querySelector("#createTable");
const tablesContainer = document.querySelector("#tables");
const snackbar = document.querySelector("#snackbar");
const modalBg = document.querySelector(".modal-bg");
const allTablesModal = document.querySelector(".all-tables-modal");
const addTableNameModal = document.querySelector(".table-name-modal");
const addTableNameModalInput = document.querySelector("#tableInputName");
const tableNameInputContinueBtn = document.querySelector(
  "#tableNameInputContinueBtn",
);

const params = new URLSearchParams(window.location.search);
const redirectCode = params.get("r");
if (redirectCode === "mnd") {
  snackbar.show("warn", "<p>Defina uma mesa para <br> continuar</p>");
}

tablesContainer.addEventListener("click", selectTable);
createTableBtn.addEventListener("click", toggleAllTablesModal);
modalBg.addEventListener("click", closeModals);
allTablesModal.addEventListener("click", addName);
tableNameInputContinueBtn.addEventListener("click", postTableSession);

let occupiedTables = [];

function closeModals(e) {
  if (e.target !== modalBg) return;

  allTablesModal.classList.add("all-tables-modal--hidden");
  addTableNameModal.classList.add("table-name-modal--hidden");
  modalBg.classList.add("modal-bg--hidden");
  addTableNameModalInput.value = "";
  tableNameInputContinueBtn.removeAttribute("data-table-id");
  document.body.style.overflow = "";
}

async function postTableSession(e) {
  console.log(e.target);
  const tableId = e.target.dataset.tableId;
  console.log(tableId);
  const name = addTableNameModalInput.value || null;

  try {
    const response = await fetch(`${API_URL}/api/v1/table-sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tableId, name }),
    });

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    }

    const tableSession = await response.json();

    sessionStorage.setItem("tableSessionId", tableSession.id);
    sessionStorage.setItem("tableNumber", tableSession.number);
    window.location.href = "/menus";
  } catch (error) {
    console.error(error);
    snackbar.show(
      "error",
      "<p>Erro ao criar nova mesas <br> Tente novamente.</p>",
    );
  }
}

function toggleTableNameInput() {
  addTableNameModal.classList.toggle("table-name-modal--hidden");
}

function toggleAllTablesModal() {
  for (let table of allTablesModal.children) {
    if (occupiedTables.includes(table.textContent)) {
      table.disabled = true;
      table.classList.add("all-tables-modal__table-number--disabled");
    }
  }

  document.body.style.overflow = "hidden";
  modalBg.classList.remove("modal-bg--hidden");
  allTablesModal.classList.toggle("all-tables-modal--hidden");
}

function addName(e) {
  const numberClicked = e.target.closest(".all-tables-modal__table-number");
  if (!numberClicked || numberClicked.hasAttribute("disabled")) return;

  const tableId = numberClicked.dataset.tableId;
  tableNameInputContinueBtn.setAttribute("data-table-id", tableId);

  toggleAllTablesModal();
  toggleTableNameInput();
}

function selectTable(e) {
  const tableCard = e.target.closest(".table-card");
  if (!tableCard) return;

  sessionStorage.setItem("tableSessionId", tableCard.dataset.id);
  sessionStorage.setItem(
    "tableNumber",
    parseInt(tableCard.firstElementChild.textContent),
  );
  window.location.href = `/menus`;
}

function addTablesSessionToHTML(tableSessions) {
  if (tableSessions.length === 0) {
    tablesContainer.innerHTML = "";
    return;
  }

  const tablesFrag = document.createDocumentFragment();

  tableSessions.forEach((tableSession) => {
    const tableCard = document.createElement("div");
    tableCard.className = "table-card";
    tableCard.dataset.id = tableSession.id;

    const tableCardNumber = document.createElement("h2");
    tableCardNumber.className = "table-card__number";
    tableCardNumber.textContent = tableSession.number;

    tableCard.append(tableCardNumber);

    if (tableSession.name) {
      const tableCardName = document.createElement("p");
      tableCardName.className = "table-card__name";
      tableCardName.textContent = tableSession.name;
      tableCard.append(tableCardName);
    }

    tablesFrag.append(tableCard);
  });

  tablesContainer.replaceChildren(tablesFrag);
}

function addTablesToHTML(tables) {
  if (tables.length === 0) {
    allTablesModal.innerHTML = `
      <p>Parece que não há a existência de nenhuma mesa no momento</p>
    `;
    return;
  }

  const tablesFrag = document.createDocumentFragment();
  tables.forEach((table) => {
    const button = document.createElement("button");

    button.className = "all-tables-modal__table-number";
    button.dataset.tableId = table.id;
    button.textContent = table.number;

    tablesFrag.append(button);
  });

  allTablesModal.append(tablesFrag);
}

async function fetchTableSessionsOpen() {
  try {
    const response = await fetch(`${API_URL}/api/v1/table-sessions/open`);
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    }

    const tableSessions = await response.json();
    for (let { number } of tableSessions) {
      occupiedTables.push(number);
    }
    addTablesSessionToHTML(tableSessions);
  } catch (error) {
    console.error(error);
    snackbar.show(
      "error",
      "<p>Erro ao tentar obter informações sobre as mesas <br> Tente novamente.</p>",
    );
  }
}

async function fetchTables() {
  const response = await fetch(`${API_URL}/api/v1/tables`);
  if (!response.ok) {
    throw {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    };
  }
  const tables = await response.json();

  addTablesToHTML(tables);
}

async function setupPage() {
  await fetchTables();
  await fetchTableSessionsOpen();
}

setupPage();

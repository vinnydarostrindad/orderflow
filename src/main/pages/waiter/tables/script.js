import "/waiter/components/nav/script.js";
import "/waiter/components/menu-card.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import API_URL from "/scripts/config-api-url.js";

sessionStorage.removeItem("tableId");
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

tablesContainer.addEventListener("click", selectTable);
createTableBtn.addEventListener("click", toggleAllTablesModal);
modalBg.addEventListener("click", closeModals);
allTablesModal.addEventListener("click", addName);
tableNameInputContinueBtn.addEventListener("click", postTable);

let occupiedTables = [];

function closeModals(e) {
  if (e.target !== modalBg) return;

  allTablesModal.classList.add("all-tables-modal--hidden");
  addTableNameModal.classList.add("table-name-modal--hidden");
  modalBg.classList.add("modal-bg--hidden");
  addTableNameModalInput.value = "";
  tableNameInputContinueBtn.removeAttribute("data-number");
  document.body.style.overflow = "";
}

async function postTable(e) {
  const number = e.target.dataset.number;
  const name = addTableNameModalInput.value || null;

  try {
    const response = await fetch(`${API_URL}/api/v1/table`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ number, name }),
    });

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    }

    const table = await response.json();

    sessionStorage.setItem("tableId", table.id);
    sessionStorage.setItem("tableNumber", table.number);
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

  const number = numberClicked.textContent;
  tableNameInputContinueBtn.setAttribute("data-number", number);

  toggleAllTablesModal();
  toggleTableNameInput();
}

function selectTable(e) {
  const tableCard = e.target.closest(".table-card");
  if (!tableCard) return;

  sessionStorage.setItem("tableId", tableCard.dataset.id);
  sessionStorage.setItem(
    "tableNumber",
    parseInt(tableCard.firstElementChild.textContent),
  );
  window.location.href = `/menus`;
}

function addTablesToHTML(tables) {
  if (tables.length === 0) {
    tablesContainer.innerHTML = "";
    return;
  }

  const tablesFrag = document.createDocumentFragment();

  tables.map((table) => {
    const tableCard = document.createElement("div");
    tableCard.className = "table-card";
    tableCard.dataset.id = table.id;

    const tableCardNumber = document.createElement("h2");
    tableCardNumber.className = "table-card__number";
    tableCardNumber.textContent = table.number;

    tableCard.append(tableCardNumber);

    if (table.name) {
      const tableCardName = document.createElement("p");
      tableCardName.className = "table-card__name";
      tableCardName.textContent = table.name;
      tableCard.append(tableCardName);
    }

    tablesFrag.append(tableCard);
  });

  tablesContainer.replaceChildren(tablesFrag);
}

async function getTables() {
  try {
    const response = await fetch(`${API_URL}/api/v1/table`);
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    }

    const tables = await response.json();
    for (let { number } of tables) {
      occupiedTables.push(number);
    }
    addTablesToHTML(tables);
  } catch (error) {
    console.error(error);
    snackbar.show(
      "error",
      "<p>Erro ao tentar obter informações sobre as mesas <br> Tente novamente.</p>",
    );
  }
}

getTables();

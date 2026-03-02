import "/waiter/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import "/components/order-card.js";
import API_URL from "/scripts/config-api-url.js";

const snackbar = document.querySelector("#snackbar");
const navbar = document.querySelector("#navBar");
const tablesContainer = document.querySelector("#tables");

tablesContainer.addEventListener("click", goToTable);

function goToTable(e) {
  const btn = e.target.closest(".table-card");
  if (!btn) return;

  window.location.href = `http://localhost:3000/table/${btn.dataset.table_id}?n=${btn.dataset.table_number}`;
}

async function fetchTables() {
  const res = await fetch(`${API_URL}/api/v1/table`);

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const tables = await res.json();
  return tables;
}

function buildOrderedItems(tables) {
  const fragment = document.createDocumentFragment();

  for (let table of tables) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.table_id = table.id;
    button.dataset.table_number = table.number;
    button.classList.add("table-card");
    const h4 = document.createElement("h4");
    h4.classList.add("table-card__number");
    h4.innerText = table.number;
    button.append(h4);
    if (table.name) {
      const p = document.createElement("p");
      p.innerText = table.name;
      p.classList.add("table-card__name");
      button.append(p);
    }
    fragment.append(button);
  }

  return fragment;
}

function renderTables(exists, tablesFrag) {
  if (exists) {
    tablesContainer.append(tablesFrag);
  } else {
    tablesContainer.innerHTML = `<p class="orders-none">Nenhuma mesa registrada!</p>`;
  }
}

async function setupOrdersPage() {
  try {
    const tables = await fetchTables();
    const tablesFragment = buildOrderedItems(tables);

    renderTables(tables.length > 0, tablesFragment);
    document.querySelectorAll(".clients-tables__skeleton").forEach((el) => {
      el.remove();
    });
  } catch (err) {
    console.error(err);
    snackbar.show(
      "error",
      "<p>Error ao obter os pedidos feitos. <br> Tente novamente!</p>",
    );
  }
}

setupOrdersPage();

navbar.firstElementChild.firstElementChild.classList.remove(
  "navbar__item--selected",
);
navbar.firstElementChild.children[2].classList.add("navbar__item--selected");

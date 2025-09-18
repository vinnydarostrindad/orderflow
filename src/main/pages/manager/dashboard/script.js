import "/manager/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import API_URL from "/scripts/config-api-url.js";
import textStats from "/manager/dashboard/js/text-stats.js";
import { makeChart, updateChart } from "/manager/dashboard/js/chart.js";
import showLastOrders from "/manager/dashboard/js/last-orders.js";

const businessName = document.querySelector("#businessName");
const timeFilterSelect = document.querySelector(".business-stats__select");
const chartPorcentage = document.querySelector("#chartPorcentage");
const chartQuantity = document.querySelector("#chartQuantity");
const chartBox = document.querySelector(".business-stats__chart");
const snackbar = document.querySelector("#snackbar");

let orderedItems = [];
let orderedMenuItems = [];
let chartExists = false;
let intervalId;

function resetChartSkeleton() {
  chartPorcentage.textContent = "";
  chartQuantity.textContent = "";

  chartBox.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="chart-skeleton skeleton">
        <div class="chart-hole"></div>
      </div>
    `,
  );
}

async function fetchBusiness() {
  try {
    const response = await fetch(`${API_URL}/api/v1/business`);
    return await response.json();
  } catch (error) {
    snackbar.show(
      "error",
      "<p>Erro ao tentar obter empresa. <br> Tente novamente.</p>",
    );
    console.error(error);
  }
}

async function fetchOrderedItems() {
  try {
    const filter = timeFilterSelect.value;
    const response = await fetch(
      `${API_URL}/api/v1/ordered-items?period=${filter}`,
    );
    return await response.json();
  } catch (error) {
    snackbar.show(
      "error",
      "<p>Erro ao tentar obter os pedidos. <br> Tente novamente.</p>",
    );
    console.error(error);
    return [];
  }
}

async function fetchOrderedMenuItems() {
  return await Promise.all(
    orderedItems.map(async (orderedItem) => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/menu-item/${orderedItem.menuItemId}`,
        );
        return await response.json();
      } catch (error) {
        console.error(error);
      }
    }),
  );
}

async function loadInitialData() {
  const { name } = await fetchBusiness();
  businessName.classList.remove("skeleton");
  businessName.textContent = name;

  orderedItems = await fetchOrderedItems();
  orderedMenuItems = orderedItems.length ? await fetchOrderedMenuItems() : [];

  textStats(orderedItems);
  chartExists = makeChart(orderedItems, orderedMenuItems);
  showLastOrders(orderedMenuItems);
}

async function updateDatas() {
  if (intervalId) clearInterval(intervalId);

  resetChartSkeleton();

  orderedItems = await fetchOrderedItems();
  orderedMenuItems = orderedItems.length ? await fetchOrderedMenuItems() : [];

  textStats(orderedItems);
  chartExists = makeChart(orderedItems, orderedMenuItems);

  startAutoRefresh();
}

function startAutoRefresh() {
  intervalId = setInterval(async () => {
    orderedItems = await fetchOrderedItems();
    orderedMenuItems = orderedItems.length ? await fetchOrderedMenuItems() : [];

    textStats(orderedItems);
    if (orderedItems.length === 0) {
      chartExists = makeChart(orderedItems, orderedMenuItems);
    } else if (chartExists) {
      updateChart(orderedItems, orderedMenuItems);
    } else {
      chartExists = makeChart(orderedItems, orderedMenuItems);
    }
    showLastOrders(orderedMenuItems);
  }, 5000);
}

function init() {
  timeFilterSelect.addEventListener("change", updateDatas);

  loadInitialData();
  startAutoRefresh();
}

init();

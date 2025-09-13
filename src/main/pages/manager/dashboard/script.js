import "/components/snackbar.js";
import "/components/header/script.js";
import API_URL from "/scripts/config-api-url.js";
import { makeChart, updateChart } from "/manager/dashboard/js/chart.js";
import {
  showLastOrders,
  updateLastOrders,
} from "/manager/dashboard/js/last-orders.js";

const headerMenuBtn = document.querySelector("#headerMenuBtn");
const navBar = document.querySelector("#navBar");
const timeFilterSelect = document.querySelector(".business-stats__select");
// const revenue = document.querySelector("#revenue");
// const hourlyRevenue = document.querySelector("#hourlyRevenue");
const ordersAmount = document.querySelector("#ordersAmount");
const completedOrder = document.querySelector("#completedOrders");
const canceledOrder = document.querySelector("#canceledOrders");
const snackbar = document.querySelector("#snackbar");

let orderedItems;
let orderedMenuItems;

headerMenuBtn.addEventListener("click", togglenavBar);
timeFilterSelect.addEventListener("change", fetchFilteredOrderedItems);

function togglenavBar() {
  document.body.style.overflow = navBar.classList.contains("navbar--hidden")
    ? "hidden"
    : "";
  navBar.classList.toggle("navbar--hidden");
}

async function fetchOrderedItems() {
  try {
    const response = await fetch(`${API_URL}/api/v1/ordered-items`);

    // console.log(response.ok);
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
  const orderedMenuItems = await Promise.all(
    orderedItems.map(async (orderedItem) => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/menu-item/${orderedItem.menuItemId}`,
        );
        // console.log(response.ok);
        return await response.json();
      } catch (error) {
        console.error(error);
      }
    }),
  );

  return orderedMenuItems;
}

async function fetchFilteredOrderedItems(e) {
  console.log("Filter:", e.target.value);
  // Terminar de fazer essa função quando fizer esse filter no backend
  // const filteredOrderedItems = await fetch("http:///localhost:3000/api/v1/business/id/orders?time=week")
}

// TextStats funcitons

// async function showRevenue() {
// Quando fizer a API dos pagamentos, finalizar essa função
// const revenue = await fetch("${API_URL}/api/v1/business/id/payments")
// Fazer os calculos necessários
// revenue.textContent = revenueCalculated
//
// showHourlyRevenue(revenueCalclated)
// }

// function showHourlyRevenue(revenue) {
// Quando fizer a API dos pagamentos, finalizar essa função
// hourlyRevenue.textContent = revenue / 24; Talvez;
// }

function showAmountOfOrders() {
  const amountOfOrders = orderedItems.reduce((acc, item) => {
    return acc + +item.quantity;
  }, 0);

  ordersAmount.textContent = amountOfOrders;
}

function showAmountOfOrdersCompleted() {
  const ordersCompleted = orderedItems.reduce((acc, item) => {
    if (item.status === "delivered") return acc++;
    return acc;
  }, 0);

  completedOrder.textContent = ordersCompleted;
}

function showAmountOfOrdersCanceled() {
  const ordersCanceled = orderedItems.reduce((acc, item) => {
    if (item.status === "canceled") return acc++;
    return acc;
  }, 0);

  canceledOrder.textContent = ordersCanceled;
}

orderedItems = await fetchOrderedItems();
orderedMenuItems = orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];
const lastFetchTime = Date.now();

showAmountOfOrders();
showAmountOfOrdersCompleted();
showAmountOfOrdersCanceled();
makeChart(orderedItems, orderedMenuItems, lastFetchTime);
showLastOrders(orderedItems, orderedMenuItems);

setInterval(async () => {
  orderedItems = await fetchOrderedItems();
  orderedMenuItems =
    orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];

  showAmountOfOrders();
  showAmountOfOrdersCompleted();
  showAmountOfOrdersCanceled();
  updateChart(orderedItems, orderedMenuItems);
  updateLastOrders(orderedItems, orderedMenuItems);
  console.log("FOI, legal");
}, 5000);

import "/components/snackbar.js";
import "/components/header/script.js";
import API_URL from "/scripts/config-api-url.js";
import textStats from "/manager/dashboard/js/text-stats.js";
import { makeChart, updateChart } from "/manager/dashboard/js/chart.js";
import {
  showLastOrders,
  updateLastOrders,
} from "/manager/dashboard/js/last-orders.js";

const headerMenuBtn = document.querySelector("#headerMenuBtn");
const navBar = document.querySelector("#navBar");
const timeFilterSelect = document.querySelector(".business-stats__select");
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

orderedItems = await fetchOrderedItems();
orderedMenuItems = orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];
const lastFetchTime = Date.now();

textStats(orderedItems);
makeChart(orderedItems, orderedMenuItems, lastFetchTime);
showLastOrders(orderedItems, orderedMenuItems);

setInterval(async () => {
  orderedItems = await fetchOrderedItems();
  orderedMenuItems =
    orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];

  textStats(orderedItems);
  updateChart(orderedItems, orderedMenuItems);
  updateLastOrders(orderedItems, orderedMenuItems);
  console.log("FOI, legal");
}, 5000);

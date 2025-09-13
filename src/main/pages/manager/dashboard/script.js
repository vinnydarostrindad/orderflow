import "/components/snackbar.js";
import "/components/header/script.js";
import API_URL from "/scripts/config-api-url.js";

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
const chartPorcentage = document.querySelector("#chartPorcentage");
const chartQuantity = document.querySelector("#chartQuantity");
const ctx = document.getElementById("salesChart").getContext("2d");
const snackbar = document.querySelector("#snackbar");

let orderedItems;
let orderedMenuItems;
let salesChart;
let lastFetchTime;

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

// Make chart functions

function getInfosToMakeChart() {
  const menuItemsMap = new Map(orderedMenuItems.map((item) => [item.id, item]));

  const orderedItemsInfos = orderedItems.map((orderedItem) => {
    const menuItem = menuItemsMap.get(orderedItem.menuItemId);

    if (!menuItem) return;

    return {
      quantity: orderedItem.quantity,
      type: menuItem.type ? menuItem.type : "(Sem tipo)",
    };
  });

  const formatedOrderedItems = {};

  for (let item of orderedItemsInfos) {
    if (formatedOrderedItems[item.type]) {
      formatedOrderedItems[item.type] = String(
        Number(formatedOrderedItems[item.type]) + Number(item.quantity),
      );
      continue;
    }
    formatedOrderedItems[item.type] = item.quantity;
  }
  return formatedOrderedItems;
}

function makeChart() {
  document.querySelector(".chart-skeleton")?.remove();

  if (orderedItems.length === 0) {
    chartPorcentage.textContent = "Nada foi vendido durante esse período";
    chartQuantity.textContent = "";
    return;
  }

  const formatedOrderedItems = getInfosToMakeChart();

  // eslint-disable-next-line no-undef
  salesChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(formatedOrderedItems),
      datasets: [
        {
          data: Object.values(formatedOrderedItems),
          hoverOffset: 20,
        },
      ],
    },
    options: {
      responsive: false,
      layout: {
        padding: 20,
      },
      plugins: {
        legend: {
          position: "none",
        },
      },
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          const index = chartElement[0].index;
          const value = salesChart.data.datasets[0].data[index];

          const percentage = (
            (value /
              salesChart.data.datasets[0].data.reduce((a, b) => +a + +b)) *
            100
          ).toFixed(1);

          chartPorcentage.innerText = `${percentage}%`;
          chartQuantity.innerText = `(${value})`;
        } else {
          chartPorcentage.innerText = "";
          chartQuantity.innerText = "";
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    },
  });

  document.querySelector("canvas").onmouseleave = () => {
    chartPorcentage.innerText = "";
    chartQuantity.innerText = "";
  };
}

function getInfosToUpdateChart() {
  const orderedItemsInfos = orderedItems
    .map((orderedItem) => {
      for (let menuItem of orderedMenuItems) {
        if (menuItem.id === orderedItem.menuItemId) {
          if (Date.parse(orderedItem.createdAt) < lastFetchTime) continue;
          return {
            quantity: orderedItem.quantity,
            type: menuItem.type ? menuItem.type : "(Sem tipo)",
          };
        }
      }
    })
    .filter((elem) => elem !== undefined);

  const formatedOrderedItems = {};
  for (let item of orderedItemsInfos) {
    if (formatedOrderedItems[item.type]) {
      formatedOrderedItems[item.type] = String(
        Number(formatedOrderedItems[item.type]) + Number(item.quantity),
      );
      continue;
    }
    formatedOrderedItems[item.type] = item.quantity;
  }

  return formatedOrderedItems;
}

function updateChart() {
  const addedOrders = getInfosToUpdateChart();
  lastFetchTime = Date.now();

  for (let order in addedOrders) {
    if (salesChart.data.labels.includes(order)) {
      const indexOfOrder = salesChart.data.labels.indexOf(order);

      const currentValue = Number(
        salesChart.data.datasets[0].data[indexOfOrder],
      );
      const addedValue = Number(addedOrders[order]);

      salesChart.data.datasets[0].data[indexOfOrder] =
        currentValue + addedValue;
    } else {
      salesChart.data.labels.push(order);

      salesChart.data.datasets[0].data.push(addedOrders.order);
    }

    salesChart.update();
  }
}

orderedItems = await fetchOrderedItems();
orderedMenuItems = orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];
lastFetchTime = Date.now();

showAmountOfOrders();
showAmountOfOrdersCompleted();
showAmountOfOrdersCanceled();
makeChart();
showLastOrders(orderedItems, orderedMenuItems);

setInterval(async () => {
  orderedItems = await fetchOrderedItems();
  orderedMenuItems =
    orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];

  showAmountOfOrders();
  showAmountOfOrdersCompleted();
  showAmountOfOrdersCanceled();
  updateChart();
  updateLastOrders(orderedItems, orderedMenuItems);
  console.log("FOI, legal");
}, 5000);

import "/components/snackbar.js";

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
const carouselLeftBtn = document.querySelector("#carouselLeftBtn");
const carouselRightBtn = document.querySelector("#carouselRightBtn");
const ordersBox = document.querySelector("#lastOrders");
const snackbar = document.querySelector("#snackbar");

let orderedItems;
let orderedMenuItems;
let salesChart;
let lastFetchTime;
let orderTimeIntervalId;
let currentTraslateX = 0;

headerMenuBtn.addEventListener("click", togglenavBar);
timeFilterSelect.addEventListener("change", fetchFilteredOrderedItems);
carouselLeftBtn.addEventListener("click", moveLastOrders);
carouselRightBtn.addEventListener("click", moveLastOrders);

function togglenavBar() {
  document.body.style.overflow = navBar.classList.contains("navbar--hidden")
    ? "hidden"
    : "";
  navBar.classList.toggle("navbar--hidden");
}

async function fetchOrderedItems() {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/ordered-items`);

    console.log(response.ok);
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
          `http://localhost:3000/api/v1/menu-item/${orderedItem.menuItemId}`,
        );
        console.log(response.ok);
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
// const revenue = await fetch("http://localhost:3000/api/v1/business/id/payments")
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

  let formatedOrderedItems = {};

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

  let formatedOrderedItems = {};
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

// Last Orders Funcitons

function calculateTimePassed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getLastOrdersInfo() {
  const orderedItemsInfos = orderedItems.map((orderedItem) => {
    console.log(orderedItem);
    for (let orderedMenuItem of orderedMenuItems) {
      if (orderedItem.menuItemId === orderedMenuItem.id) {
        return {
          name: orderedMenuItem.name,
          quantity: orderedItem.quantity,
          imagePath: orderedMenuItem.imagePath,
          status: orderedItem.status,
          tableNumber: orderedItem.tableNumber,
          createdAt: orderedItem.createdAt,
        };
      }
    }
  });

  return orderedItemsInfos.reverse();
}

async function showLastOrders() {
  const orderedItemsInfos = getLastOrdersInfo(orderedItems, orderedMenuItems);

  document.querySelector(".last-orders__skeletons")?.remove();

  if (orderedItemsInfos.length === 0) {
    ordersBox.parentElement.innerHTML = `<p>Nenhum pedido foi feito hoje</p>`;
    carouselLeftBtn.style.opacity = 0;
    carouselLeftBtn.disabled = true;
    carouselRightBtn.style.opacity = 0;
    carouselRightBtn.disabled = true;
    return;
  }

  carouselLeftBtn.style.opacity = "";
  carouselRightBtn.style.opacity = "";
  if (carouselLeftBtn.disabled) {
    carouselRightBtn.disabled = false;
  }

  let amountOfLastOrders = 0;
  ordersBox.innerHTML = "";
  orderedItemsInfos.forEach((item) => {
    for (let i = 0; i < +item.quantity; i++) {
      if (amountOfLastOrders === 10) return;
      const createdAt = Date.parse(item.createdAt);

      ordersBox.insertAdjacentHTML(
        "beforeend",
        `
      <div class="last-orders__order">
        <div>
          ${item.imagePath ? `<img src="../${item.imagePath}" alt="${item.name}" />` : ""}
          
          <h4>${item.name}</h4>
        </div>
        <div class="last-orders__info">
          <p class="last-orders__status">Status: ${item.status}</p>
          <p class="last-orders__table-number">Mesa: ${item.tableNumber}</p>
          <p class="last-orders__time">Tempo: <span class="order-time" data-created-at="${createdAt}">${calculateTimePassed(Date.now() - createdAt)}</span></p>
        </div>
      </div>  
    `,
      );
      amountOfLastOrders++;
    }
  });

  const lastOrders = document.querySelectorAll(".order-time");

  if (orderTimeIntervalId) clearInterval(orderTimeIntervalId);

  orderTimeIntervalId = setInterval(() => {
    lastOrders.forEach((timer) => {
      timer.textContent = calculateTimePassed(
        Date.now() - timer.dataset.createdAt,
      );
    });
  }, 1000);
}

function moveLastOrders(e) {
  const allOrders = document.querySelectorAll(".last-orders__order");

  const ordersGap = 1.2 * 16;
  const ordersWidth = 215;
  const step = ordersWidth + ordersGap;
  const btn = e.target.closest("button");

  const ordersShown = Math.floor(
    ordersBox.parentElement.clientWidth / allOrders[0].offsetWidth,
  );

  if (allOrders.length - ordersShown === 0) {
    carouselRightBtn.style.opacity = 0;
    carouselRightBtn.disabled = true;
    carouselLeftBtn.style.opacity = 0;
    carouselLeftBtn.disabled = true;
    return;
  }

  if (btn.id === "carouselRightBtn") {
    currentTraslateX -= step;

    if (currentTraslateX <= -((allOrders.length - ordersShown) * step)) {
      carouselRightBtn.disabled = true;
    }

    carouselLeftBtn.disabled = false;
  } else if (btn.id === "carouselLeftBtn") {
    currentTraslateX += step;

    if (currentTraslateX >= 0) {
      currentTraslateX = 0;
      carouselLeftBtn.disabled = true;
    }

    carouselRightBtn.disabled = false;
  }

  ordersBox.style.translate = currentTraslateX + "px";
  console.log(currentTraslateX);
}

orderedItems = await fetchOrderedItems();
orderedMenuItems = orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];
lastFetchTime = Date.now();

showAmountOfOrders();
showAmountOfOrdersCompleted();
showAmountOfOrdersCanceled();
makeChart();
showLastOrders();

setInterval(async () => {
  orderedItems = await fetchOrderedItems();
  orderedMenuItems =
    orderedItems.length > 0 ? await fetchOrderedMenuItems() : [];

  showAmountOfOrders();
  showAmountOfOrdersCompleted();
  showAmountOfOrdersCanceled();
  updateChart();
  showLastOrders();
}, 30000);

import "/waiter/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import "/components/order-card.js";
import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const snackbar = document.querySelector("#snackbar");
const navbar = document.querySelector("#navBar");
const searchBar = document.querySelector("#search");
const statusSelect = document.querySelector("#statusSelect");
const readyOrdersSection = document.querySelector(".ready-orders");
const inProgressOrdersSection = document.querySelector(".in-progress-orders");
const pendingOrdersSection = document.querySelector(".pending-orders");
const readyOrdersContainer = document.querySelector("#readyOrders");
const inProgressOrdersContainer = document.querySelector("#inProgressOrders");
const pendingOrdersContainer = document.querySelector("#pendingOrders");
const allOrdersContainer = document.querySelector(".orders");
const orderInfoContainer = document.querySelector("#orderInfoContainer");
const setOrderToCancelledBtn = document.querySelector(
  "#setOrderToCancelledBtn",
);
const closeOrderInfoBtn = document.querySelector("#closeOrderInfoBtn");

const orderInfoTimer = document.querySelector("#orderTime");
const orderInfoImg = document.querySelector("#orderImg");
const orderInfoName = document.querySelector("#orderName");
const orderInfoTable = document.querySelector("#orderTable");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");
const orderInfoIngridients = document.querySelector("#orderIngredients");

var allOrders = [];
var ordersPending = [];
var ordersInProgress = [];
var ordersReady = [];
var orderTimers = [];
var intervalId;
var specificIntervalId;

allOrdersContainer.addEventListener("click", showOrderInfo);
setOrderToCancelledBtn.addEventListener("click", setOrderToCancelled);
statusSelect.addEventListener("change", filterOrders);
searchBar.addEventListener("input", search);

function search(e) {
  const searchText = e.target.value;
  renderSearchedOrders(searchText);
  filterOrders();
}

function filterOrders() {
  const filter = statusSelect.value;
  switch (filter) {
    case "everything":
      readyOrdersSection.classList.remove("ready-orders--hidden");
      inProgressOrdersSection.classList.remove("in-progress-orders--hidden");
      pendingOrdersSection.classList.remove("pending-orders--hidden");
      break;
    case "pending":
      readyOrdersSection.classList.add("ready-orders--hidden");
      inProgressOrdersSection.classList.add("in-progress-orders--hidden");
      pendingOrdersSection.classList.remove("pending-orders--hidden");
      break;
    case "in_progress":
      readyOrdersSection.classList.add("ready-orders--hidden");
      inProgressOrdersSection.classList.remove("in-progress-orders--hidden");
      pendingOrdersSection.classList.add("pending-orders--hidden");
      break;
    case "ready":
      readyOrdersSection.classList.remove("ready-orders--hidden");
      inProgressOrdersSection.classList.add("in-progress-orders--hidden");
      pendingOrdersSection.classList.add("pending-orders--hidden");
      break;
  }
}

function calculateTimePassed(time) {
  const totalSeconds = Math.floor((Date.now() - new Date(time)) / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function organizeOrdersInArray() {
  ordersPending = [];
  ordersInProgress = [];
  ordersReady = [];

  allOrders.forEach((order) => {
    if (order.status === "pending") {
      ordersPending.push(order);
    } else if (order.status === "in_progress") {
      ordersInProgress.push(order);
    } else if (order.status === "ready") {
      ordersReady.push(order);
    }
  });

  ordersPending.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  ordersInProgress.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  ordersReady.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

async function fetchItemInfos(id) {
  const res = await fetch(`${API_URL}/api/v1/menu-item/${id}`);

  if (!res) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const itemInfo = await res.json();
  return itemInfo;
}

async function fetchOrderTableId(orderId) {
  const res = await fetch(`${API_URL}/api/v1/order/${orderId}`);

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const order = await res.json();
  return order.tableId;
}

async function fetchOrderedItems() {
  const res = await fetch(`${API_URL}/api/v1/ordered-items`);

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const orderedItems = await res.json();
  return orderedItems;
}

function buildOrderedItems(items) {
  const fragment = document.createDocumentFragment();

  for (var item of items) {
    const { publicUrl } = supabase.getUrl("orderflow", item.imagePath);

    const orderCard = document.createElement("order-card");

    orderCard.setAttribute("name", item.name);
    orderCard.setAttribute("quantity", item.quantity);
    orderCard.setAttribute("table", item.tableNumber);
    orderCard.setAttribute("imgPath", publicUrl);
    if (item.notes) orderCard.setAttribute("notes", true);
    if (item.maxTime) orderCard.setAttribute("data-max_time", item.id);
    orderCard.setAttribute("data-id", item.id);
    orderCard.setAttribute("data-time", item.createdAt);
    fragment.appendChild(orderCard);
  }

  return fragment;
}

function configTimers() {
  orderTimers = [];

  document.querySelectorAll(".order-item__time").forEach((timer) => {
    orderTimers.push(timer);
    const timePassedString = calculateTimePassed(timer.dataset.time);
    timer.innerText = `Tempo: ${timePassedString}`;
  });

  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    orderTimers.forEach((timer) => {
      const timePassedString = calculateTimePassed(timer.dataset.time);
      timer.innerText = `Tempo: ${timePassedString}`;
    });
  }, 1000);
}

function configOrderInfoTimer() {
  const orderId = orderInfoContainer.dataset.order_id;
  var { createdAt } = allOrders.find((order) => order.id === orderId);

  const timePassedString = calculateTimePassed(createdAt);
  orderInfoTimer.innerText = `Tempo: ${timePassedString}`;

  if (specificIntervalId) clearInterval(specificIntervalId);

  specificIntervalId = setInterval(() => {
    const currentTimePassedString = calculateTimePassed(createdAt);
    orderInfoTimer.innerText = `Tempo: ${currentTimePassedString}`;
  }, 1000);
}

function renderSearchedOrders(searchText) {
  if (ordersReady.length === 0) {
    readyOrdersContainer.innerHTML = `<p class="orders-none">Nenhum pedido pendente!</p>`;
  } else {
    const filteredReadyOrders = ordersReady.filter((order) =>
      order.name.includes(searchText),
    );
    if (filteredReadyOrders.length === 0) {
      readyOrdersSection.classList.add("ready-orders--hidden");
    } else {
      readyOrdersSection.classList.remove("ready-orders--hidden");
    }
    const readyOrdersFragment = buildOrderedItems(filteredReadyOrders);
    readyOrdersContainer.replaceChildren(readyOrdersFragment);
  }

  if (ordersInProgress.length === 0) {
    inProgressOrdersContainer.innerHTML = `<p class="orders-none">Nenhum pedido em andamento!</p>`;
  } else {
    const filteredInProgressOrders = ordersInProgress.filter((order) =>
      order.name.includes(searchText),
    );
    if (filteredInProgressOrders.length === 0) {
      inProgressOrdersSection.classList.add("in-progress-orders--hidden");
    } else {
      inProgressOrdersSection.classList.remove("in-progress-orders--hidden");
    }
    const inProgressOrdersFragment = buildOrderedItems(
      filteredInProgressOrders,
    );
    inProgressOrdersContainer.replaceChildren(inProgressOrdersFragment);
  }

  if (ordersPending.length === 0) {
    pendingOrdersContainer.innerHTML = `<p class="orders-none">Nenhum pedido em andamento!</p>`;
  } else {
    const filteredPendingOrders = ordersPending.filter((order) =>
      order.name.includes(searchText),
    );
    if (filteredPendingOrders.length === 0) {
      pendingOrdersSection.classList.add("pending-orders--hidden");
    } else {
      pendingOrdersSection.classList.remove("pending-orders--hidden");
    }
    const pendingOrdersFragment = buildOrderedItems(filteredPendingOrders);
    pendingOrdersContainer.replaceChildren(pendingOrdersFragment);
  }

  configTimers();
}

function renderAllOrders() {
  if (ordersReady.length === 0) {
    readyOrdersContainer.innerHTML = `<p class="orders-none">Nenhum pedido pendente!</p>`;
  } else {
    const readyOrdersFragment = buildOrderedItems(ordersReady);
    readyOrdersContainer.replaceChildren(readyOrdersFragment);
  }

  if (ordersInProgress.length === 0) {
    inProgressOrdersContainer.innerHTML = `<p class="orders-none">Nenhum pedido em andamento!</p>`;
  } else {
    const inProgressOrdersFragment = buildOrderedItems(ordersInProgress);
    inProgressOrdersContainer.replaceChildren(inProgressOrdersFragment);
  }

  if (ordersPending.length === 0) {
    pendingOrdersContainer.innerHTML = `<p class="orders-none">Nenhum pedido em andamento!</p>`;
  } else {
    const pendingOrdersFragment = buildOrderedItems(ordersPending);
    pendingOrdersContainer.replaceChildren(pendingOrdersFragment);
  }

  configTimers();
}

function closeOrderInfo(e) {
  if (e.target == orderInfoContainer || e.target == closeOrderInfoBtn) {
    orderInfoContainer.classList.add("all-order-info-container--hidden");
    orderInfoContainer.removeEventListener("click", closeOrderInfo);
    document.body.style.overflow = "";
  }
}

function showOrderInfo(e) {
  let order = e.target.closest("order-card");
  if (!order) return;

  const orderInfo = allOrders.filter((item) => item.id == order.dataset.id)[0];

  orderInfoContainer.dataset.order_id = orderInfo.id;
  orderInfoImg.src = order.getAttribute("imgPath");
  orderInfoName.innerText = order.getAttribute("name");
  orderInfoTable.innerText = `Mesa ${order.getAttribute("table")}`;
  orderInfoQuantity.innerText = "Quantidade: " + orderInfo.quantity;

  if (orderInfo.notes) {
    orderInfoNotes.hidden = false;
    orderInfoNotes.innerText = orderInfo.notes;
  } else {
    orderInfoNotes.hidden = true;
  }

  if (orderInfo.ingredients) {
    orderInfoIngridients.hidden = false;
    orderInfoIngridients.innerText = orderInfo.ingredients;
  } else {
    orderInfoIngridients.hidden = true;
  }

  orderInfoContainer.classList.remove("all-order-info-container--hidden");
  orderInfoContainer.addEventListener("click", closeOrderInfo);
  document.body.style.overflow = "hidden";

  configOrderInfoTimer();
}

async function setOrderToCancelled() {
  const orderId = orderInfoContainer.dataset.order_id;
  if (!orderId) return;

  const itemIndex = allOrders.findIndex((item) => item.id === orderId);

  const item = allOrders[itemIndex];

  try {
    await fetch(
      `${API_URL}/api/v1/table/${item.tableId}/order/${item.orderId}/item/${item.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      },
    );

    allOrders.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();

    orderInfoContainer.classList.add("all-order-info-container--hidden");
    orderInfoContainer.removeEventListener("click", closeOrderInfo);
    document.body.style.overflow = "";

    snackbar.show("btn", "Deseja voltar a ação que fez?", {
      label: "Reverter",
      action: async () => {
        try {
          await fetch(
            `${API_URL}/api/v1/table/${item.tableId}/order/${item.orderId}/item/${item.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: item.status,
              }),
            },
          );

          allOrders.push(item);

          organizeOrdersInArray();
          renderAllOrders();
        } catch (err) {
          console.error(err);
          snackbar.show("error", "<p>Erro ao passar para 'Em Progresso'</p>");
        }
      },
    });
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Em Progresso"</p>');
  }
}

async function setupOrdersPage() {
  try {
    const orderedItems = await fetchOrderedItems();

    await Promise.all(
      orderedItems.map(async (item) => {
        const tableId = await fetchOrderTableId(item.orderId);
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, tableId, name, imagePath };

        allOrders.push(enrichedItem);
      }),
    );

    organizeOrdersInArray();
    renderAllOrders();
    document.querySelectorAll(".orders__skeleton").forEach((el) => {
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
navbar.firstElementChild.children[1].classList.add("navbar__item--selected");

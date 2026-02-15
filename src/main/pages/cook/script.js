import "/cook/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import "/cook/components/order-card.js";
import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const snackbar = document.querySelector("#snackbar");
const orderedItemsContainer = document.querySelector("#orderedItemsContainer");
const ordersInProgressContainer = document.querySelector(
  "#ordersInProgressContainer",
);
const orderInfoContainer = document.querySelector("#orderInfoContainer");
const closeOrderInfoBtn = document.querySelector("#closeOrderInfoBtn");
const setOrderToDoneBtn = document.querySelector("#setOrderToDoneBtn");
const setOrderToPendingBtn = document.querySelector("#setOrderToPendingBtn");
const orderInfoTimer = document.querySelector("#orderTime");

const orderInfoImg = document.querySelector("#orderImg");
const orderInfoName = document.querySelector("#orderName");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");
const orderInfoIngridients = document.querySelector("#orderIngredients");

let ordersPending = [];
let ordersInProgress = [];
let orderTimers = [];
let specificIntervalId;
let intervalId;

orderedItemsContainer.addEventListener("click", setOrderToOnProgress);
ordersInProgressContainer.addEventListener("click", showOrderInfo);
closeOrderInfoBtn.addEventListener("click", closeOrderInfo);
setOrderToPendingBtn.addEventListener("click", setOrderToPending);
setOrderToDoneBtn.addEventListener("click", setOrderToDone);

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
  ordersPending.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  ordersInProgress.sort((a, b) => {
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
  var { createdAt } = ordersInProgress.find((order) => order.id === orderId);

  const timePassedString = calculateTimePassed(createdAt);
  orderInfoTimer.innerText = `Tempo: ${timePassedString}`;

  if (specificIntervalId) clearInterval(specificIntervalId);

  specificIntervalId = setInterval(() => {
    const currentTimePassedString = calculateTimePassed(createdAt);
    orderInfoTimer.innerText = `Tempo: ${currentTimePassedString}`;
  }, 1000);
}

function renderAllOrders() {
  if (ordersPending.length === 0) {
    orderedItemsContainer.innerHTML = `<p class="orders-none">Nenhum pedido pendente!</p>`;
  } else {
    const pendingOrdersFragment = buildOrderedItems(ordersPending);
    orderedItemsContainer.replaceChildren(pendingOrdersFragment);
  }

  if (ordersInProgress.length === 0) {
    ordersInProgressContainer.innerHTML = `<p class="orders-none">Nenhum pedido em andamento!</p>`;
  } else {
    const inProgressOrdersFragment = buildOrderedItems(ordersInProgress);
    ordersInProgressContainer.replaceChildren(inProgressOrdersFragment);
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

  const orderInfo = ordersInProgress.filter(
    (item) => item.id == order.dataset.id,
  )[0];

  orderInfoContainer.dataset.order_id = orderInfo.id;
  orderInfoImg.src = order.getAttribute("imgPath");
  orderInfoName.innerText = order.getAttribute("name");
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

async function setOrderToOnProgress(e) {
  let order = e.target.closest("order-card");
  if (!order) return;

  const itemIndex = ordersPending.findIndex(
    (item) => item.id === order.dataset.id,
  );

  try {
    await fetch(
      `${API_URL}/api/v1/table/${ordersPending[itemIndex].tableId}/order/${ordersPending[itemIndex].orderId}/item/${ordersPending[itemIndex].id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "in_progress",
        }),
      },
    );

    ordersInProgress.push(ordersPending[itemIndex]);
    ordersPending.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Em Progresso"</p>');
  }
}

async function setOrderToPending(e) {
  let orderId = e.target.closest(".all-order-info-container").dataset.order_id;
  if (!orderId) return;

  const itemIndex = ordersInProgress.findIndex((item) => item.id === orderId);
  if (itemIndex == null) return;

  try {
    await fetch(
      `${API_URL}/api/v1/table/${ordersInProgress[itemIndex].tableId}/order/${ordersInProgress[itemIndex].orderId}/item/${ordersInProgress[itemIndex].id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "pending",
        }),
      },
    );

    orderInfoContainer.classList.add("all-order-info-container--hidden");
    orderInfoContainer.removeEventListener("click", closeOrderInfo);
    document.body.style.overflow = "";

    ordersPending.push(ordersInProgress[itemIndex]);
    ordersInProgress.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao tirar de "Em Progresso"</p>');
  }
}

async function setOrderToDone() {
  const orderId = orderInfoContainer.dataset.order_id;

  const itemIndex = ordersInProgress.findIndex((order) => order.id === orderId);
  const item = ordersInProgress.find((order) => order.id === orderId);

  try {
    await fetch(
      `${API_URL}/api/v1/table/${ordersInProgress[itemIndex].tableId}/order/${ordersInProgress[itemIndex].orderId}/item/${ordersInProgress[itemIndex].id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "ready",
        }),
      },
    );

    orderInfoContainer.classList.add("all-order-info-container--hidden");
    orderInfoContainer.removeEventListener("click", closeOrderInfo);
    document.body.style.overflow = "";

    ordersInProgress.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();

    snackbar.show("btn", "Deseja voltar a aÃ§Ã£o que fez?", {
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
                status: "in_progress",
              }),
            },
          );

          ordersInProgress.push(item);

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
    snackbar.show("error", '<p>Erro ao tirar de "Em Progresso"</p>');
  }
}

async function setUpPage() {
  try {
    const orderedItems = await fetchOrderedItems();

    await Promise.all(
      orderedItems.map(async (item) => {
        const tableId = await fetchOrderTableId(item.orderId);
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, tableId, name, imagePath };

        if (enrichedItem.status === "pending") {
          ordersPending.push(enrichedItem);
        } else if (enrichedItem.status === "in_progress") {
          ordersInProgress.push(enrichedItem);
        }
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

setUpPage();

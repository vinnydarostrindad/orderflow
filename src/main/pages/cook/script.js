import "/cook/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import "/components/order-card.js";
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
const orderInfoTable = document.querySelector("#orderTable");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");
const orderInfoIngridients = document.querySelector("#orderIngredients");

let pendingOrderItems = [];
let inProgressOrderItems = [];
let orderItemTimers = [];
let specificIntervalId;
let intervalId;

orderedItemsContainer.addEventListener("click", setOrderToInProgress);
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
  pendingOrderItems.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  inProgressOrderItems.sort((a, b) => {
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

async function fetchItems() {
  const res = await fetch(`${API_URL}/api/v1/ordered-items`);

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const items = await res.json();
  return items;
}

function buildOrderedItems(items) {
  const fragment = document.createDocumentFragment();

  for (let item of items) {
    const { publicUrl } = supabase.getUrl("orderflow", item.imagePath);

    const orderCard = document.createElement("order-card");

    orderCard.setAttribute("name", item.name);
    orderCard.setAttribute("table", item.tableNumber);
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
  orderItemTimers = [];

  document.querySelectorAll(".order-item__time").forEach((timer) => {
    orderItemTimers.push(timer);
    const timePassedString = calculateTimePassed(timer.dataset.time);
    timer.innerText = `Tempo: ${timePassedString}`;
  });

  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    orderItemTimers.forEach((timer) => {
      const timePassedString = calculateTimePassed(timer.dataset.time);
      timer.innerText = `Tempo: ${timePassedString}`;
    });
  }, 1000);
}

function configOrderInfoTimer() {
  const orderItemId = orderInfoContainer.dataset.orderItemId;
  let { createdAt } = inProgressOrderItems.find(
    (item) => item.id === orderItemId,
  );

  const timePassedString = calculateTimePassed(createdAt);
  orderInfoTimer.innerText = `Tempo: ${timePassedString}`;

  if (specificIntervalId) clearInterval(specificIntervalId);

  specificIntervalId = setInterval(() => {
    const currentTimePassedString = calculateTimePassed(createdAt);
    orderInfoTimer.innerText = `Tempo: ${currentTimePassedString}`;
  }, 1000);
}

function renderAllOrders() {
  if (pendingOrderItems.length === 0) {
    orderedItemsContainer.innerHTML = `<p class="orders-none">Nenhum pedido pendente!</p>`;
  } else {
    const pendingOrdersFragment = buildOrderedItems(pendingOrderItems);
    orderedItemsContainer.replaceChildren(pendingOrdersFragment);
  }

  if (inProgressOrderItems.length === 0) {
    ordersInProgressContainer.innerHTML = `<p class="orders-none">Nenhum pedido em andamento!</p>`;
  } else {
    const inProgressOrdersFragment = buildOrderedItems(inProgressOrderItems);
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
  let orderCard = e.target.closest("order-card");
  if (!orderCard) return;

  const orderInfo = inProgressOrderItems.filter(
    (item) => item.id == orderCard.dataset.id,
  )[0];

  orderInfoContainer.dataset.orderItemId = orderInfo.id;
  orderInfoImg.src = orderCard.getAttribute("imgPath");
  orderInfoName.innerText = orderCard.getAttribute("name");
  orderInfoTable.innerText = "Mesa " + orderCard.getAttribute("table");
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

async function setOrderToInProgress(e) {
  let orderCard = e.target.closest("order-card");
  if (!orderCard) return;

  const itemIndex = pendingOrderItems.findIndex(
    (item) => item.id === orderCard.dataset.id,
  );

  try {
    await fetch(
      `${API_URL}/api/v1/table/${pendingOrderItems[itemIndex].tableId}/item/${pendingOrderItems[itemIndex].id}`,
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

    inProgressOrderItems.push(pendingOrderItems[itemIndex]);
    pendingOrderItems.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Em Progresso"</p>');
  }
}

async function setOrderToPending(e) {
  let orderItemId = e.target.closest(".all-order-info-container").dataset
    .orderItemId;
  if (!orderItemId) return;

  const itemIndex = inProgressOrderItems.findIndex(
    (item) => item.id === orderItemId,
  );
  if (itemIndex == null) return;

  try {
    await fetch(
      `${API_URL}/api/v1/table/${inProgressOrderItems[itemIndex].tableId}/item/${inProgressOrderItems[itemIndex].id}`,
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

    pendingOrderItems.push(inProgressOrderItems[itemIndex]);
    inProgressOrderItems.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao tirar de "Em Progresso"</p>');
  }
}

async function setOrderToDone() {
  const orderItemId = orderInfoContainer.dataset.orderItemId;
  if (!orderItemId) return;

  const itemIndex = inProgressOrderItems.findIndex(
    (item) => item.id === orderItemId,
  );
  const item = inProgressOrderItems.find((it) => it.id === orderItemId);

  try {
    await fetch(
      `${API_URL}/api/v1/table/${inProgressOrderItems[itemIndex].tableId}/item/${inProgressOrderItems[itemIndex].id}`,
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

    inProgressOrderItems.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();

    snackbar.show("btn", "Deseja voltar a ação que fez?", {
      label: "Reverter",
      action: async () => {
        try {
          await fetch(
            `${API_URL}/api/v1/table/${item.tableId}/item/${item.id}`,
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

          inProgressOrderItems.push(item);

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
    const orderedItems = await fetchItems();

    await Promise.all(
      orderedItems.map(async (item) => {
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, name, imagePath };

        if (enrichedItem.status === "pending") {
          pendingOrderItems.push(enrichedItem);
        } else if (enrichedItem.status === "in_progress") {
          inProgressOrderItems.push(enrichedItem);
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

import "/cook/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import "/cook/components/order-card.js";
import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const snackbar = document.querySelector("#snackbar");
const navbar = document.querySelector("#navBar");
const ordersReadyContainer = document.querySelector("#ordersReadyContainer");
const ordersDeliveredContainer = document.querySelector(
  "#ordersDeliveredContainer",
);
const ordersCancelledContainer = document.querySelector(
  "#ordersCancelledContainer",
);
const orderInfoContainer = document.querySelector("#orderInfoContainer");
const closeOrderInfoBtn = document.querySelector("#closeOrderInfoBtn");
const setOrderToInProgressBtn = document.querySelector(
  "#setOrderToInProgressBtn",
);

const orderInfoImg = document.querySelector("#orderImg");
const orderInfoName = document.querySelector("#orderName");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");
const orderInfoIngridients = document.querySelector("#orderIngredients");

let ordersReady = [];
let ordersDelivered = [];
let ordersCancelled = [];

ordersReadyContainer.addEventListener("click", showOrderInfo);
// ordersInProgressContainer.addEventListener("click", showOrderInfo);
// closeOrderInfoBtn.addEventListener("click", closeOrderInfo);
setOrderToInProgressBtn.addEventListener("click", setOrderToInProgress);
// setOrderToDoneBtn.addEventListener("click", setOrderToDone);

function calculateTime(time) {
  const totalSeconds = Math.floor(time / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function organizeOrdersInArray() {
  var ordersArray = [ordersReady, ordersDelivered, ordersCancelled];
  ordersArray.forEach((array) =>
    array.sort((a, b) => {
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    }),
  );
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
  const res = await fetch(`${API_URL}/api/v1/ordered-items?period=day`);

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
    console.log(item.createdAt);
    console.log(item.updatedAt);
    const readyTime = new Date(item.updatedAt) - new Date(item.createdAt);
    orderCard.setAttribute("data-time", readyTime);
    fragment.appendChild(orderCard);
  }

  return fragment;
}

function configTimers() {
  document.querySelectorAll(".order-item__time").forEach((timer) => {
    const timePassedString = calculateTime(timer.dataset.time);
    timer.innerText = `Tempo: ${timePassedString}`;
  });
}

function renderAllOrders() {
  if (ordersReady.length === 0) {
    ordersReadyContainer.innerHTML = `<p class="orders-none">Nenhum pedido pronto hoje!</p>`;
  } else {
    const readyOrdersFragment = buildOrderedItems(ordersReady);
    ordersReadyContainer.replaceChildren(readyOrdersFragment);
  }

  if (ordersDelivered.length === 0) {
    ordersDeliveredContainer.innerHTML = `<p class="orders-none">Nenhum pedido foi entregue hoje!</p>`;
  } else {
    const deliveredOrdersFragment = buildOrderedItems(ordersDelivered);
    ordersDeliveredContainer.replaceChildren(deliveredOrdersFragment);
  }

  if (ordersCancelled.length === 0) {
    ordersCancelledContainer.innerHTML = `<p class="orders-none">Nenhum pedido foi cancelado hoje!</p>`;
  } else {
    const cancelledOrdersFragment = buildOrderedItems(ordersCancelled);
    ordersCancelledContainer.replaceChildren(cancelledOrdersFragment);
  }
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

  const orderInfo = ordersReady.filter(
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
}

async function setOrderToInProgress(e) {
  let orderId = e.target.closest(".all-order-info-container").dataset.order_id;
  if (!orderId) return;

  const itemIndex = ordersReady.findIndex((item) => item.id === orderId);

  try {
    await fetch(
      `${API_URL}/api/v1/table/${ordersReady[itemIndex].tableId}/order/${ordersReady[itemIndex].orderId}/item/${ordersReady[itemIndex].id}`,
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

    ordersReady.splice(itemIndex, 1);

    organizeOrdersInArray();
    renderAllOrders();

    orderInfoContainer.classList.add("all-order-info-container--hidden");
    orderInfoContainer.removeEventListener("click", closeOrderInfo);
    document.body.style.overflow = "";
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Em Progresso"</p>');
  }
}

async function setUpPage() {
  navbar.firstElementChild.firstElementChild.classList.remove(
    "navbar__item--selected",
  );
  navbar.firstElementChild.children[1].classList.add("navbar__item--selected");

  try {
    const orderedItems = await fetchOrderedItems();

    await Promise.all(
      orderedItems.map(async (item) => {
        const tableId = await fetchOrderTableId(item.orderId);
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, tableId, name, imagePath };

        if (enrichedItem.status === "ready") {
          ordersReady.push(enrichedItem);
        } else if (enrichedItem.status === "delivered") {
          ordersDelivered.push(enrichedItem);
        } else if (enrichedItem.status === "cancelled") {
          ordersCancelled.push(enrichedItem);
        }
      }),
    );

    organizeOrdersInArray();
    renderAllOrders();

    configTimers();

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

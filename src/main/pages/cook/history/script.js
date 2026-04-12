import "/cook/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import "/components/order-card.js";
import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const snackbar = document.querySelector("#snackbar");
const navbar = document.querySelector("#navBar");
const readyOrderItemsContainer = document.querySelector(
  "#ordersReadyContainer",
);
const deliveredOrderItemsContainer = document.querySelector(
  "#ordersDeliveredContainer",
);
const cancelledOrderItemsContainer = document.querySelector(
  "#ordersCancelledContainer",
);
const orderInfoContainer = document.querySelector("#orderInfoContainer");
const closeOrderInfoBtn = document.querySelector("#closeOrderInfoBtn");
const setOrderToInProgressBtn = document.querySelector(
  "#setOrderToInProgressBtn",
);

const orderInfoImg = document.querySelector("#orderImg");
const orderInfoName = document.querySelector("#orderName");
const orderInfoTable = document.querySelector("#orderTable");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");
const orderInfoIngridients = document.querySelector("#orderIngredients");

let readyOrderItems = [];
let deliveredOrderItems = [];
let cancelledOrderItems = [];

readyOrderItemsContainer.addEventListener("click", showOrderInfo);
setOrderToInProgressBtn.addEventListener("click", setOrderToInProgress);

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
  let orderItemsByStatus = [
    readyOrderItems,
    deliveredOrderItems,
    cancelledOrderItems,
  ];
  orderItemsByStatus.forEach((array) =>
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

async function fetchItems() {
  // Voltar com o filtro aquí ó -> ?period=day!
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
  if (readyOrderItems.length === 0) {
    readyOrderItemsContainer.innerHTML = `<p class="orders-none">Nenhum pedido pronto hoje!</p>`;
  } else {
    const readyOrderItemsFragment = buildOrderedItems(readyOrderItems);
    readyOrderItemsContainer.replaceChildren(readyOrderItemsFragment);
  }

  if (deliveredOrderItems.length === 0) {
    deliveredOrderItemsContainer.innerHTML = `<p class="orders-none">Nenhum pedido foi entregue hoje!</p>`;
  } else {
    const deliveredOrderItemsFragment = buildOrderedItems(deliveredOrderItems);
    deliveredOrderItemsContainer.replaceChildren(deliveredOrderItemsFragment);
  }

  if (cancelledOrderItems.length === 0) {
    cancelledOrderItemsContainer.innerHTML = `<p class="orders-none">Nenhum pedido foi cancelado hoje!</p>`;
  } else {
    const cancelledOrderItemsFragment = buildOrderedItems(cancelledOrderItems);
    cancelledOrderItemsContainer.replaceChildren(cancelledOrderItemsFragment);
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
  let orderCard = e.target.closest("order-card");
  if (!orderCard) return;

  const orderInfo = readyOrderItems.filter(
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
}

async function setOrderToInProgress(e) {
  let orderItemId = e.target.closest(".all-order-info-container").dataset
    .orderItemId;
  if (!orderItemId) return;

  const itemIndex = readyOrderItems.findIndex(
    (item) => item.id === orderItemId,
  );

  try {
    await fetch(
      `${API_URL}/api/v1/table/${readyOrderItems[itemIndex].tableId}/item/${readyOrderItems[itemIndex].id}`,
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

    readyOrderItems.splice(itemIndex, 1);

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
    const orderedItems = await fetchItems();
    await Promise.all(
      orderedItems.map(async (item) => {
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, name, imagePath };

        if (enrichedItem.status === "ready") {
          readyOrderItems.push(enrichedItem);
        } else if (enrichedItem.status === "delivered") {
          deliveredOrderItems.push(enrichedItem);
        } else if (enrichedItem.status === "cancelled") {
          cancelledOrderItems.push(enrichedItem);
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

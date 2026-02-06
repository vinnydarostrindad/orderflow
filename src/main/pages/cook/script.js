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
// const setOrderToDoneBtn = document.querySelector("#setOrderToDoneBtn")

let ordersPending = [];
let ordersInProgress = [];

orderedItemsContainer.addEventListener("click", changeOrderToOnProgress);
ordersInProgressContainer.addEventListener("click", showOrderInfo);
closeOrderInfoBtn.addEventListener("click", toggleOrderInfo);
// setOrderToDoneBtn.addEventListener("click", setOrderToDone)

function changeOrderToOnProgress(e) {
  let order = e.target.closest("order-card");
  if (!order) return;

  console.log(ordersPending);
  const itemIndex = ordersPending.findIndex(
    (item) => item.id === order.dataset.id,
  );
  ordersInProgress.push(ordersPending[itemIndex]);
  ordersPending.splice(itemIndex, 1);
  console.log(ordersPending);
  console.log(ordersInProgress);

  ordersInProgressContainer.appendChild(order);
}

function showOrderInfo(e) {
  let order = e.target.closest("order-card");
  if (!order) return;

  toggleOrderInfo(order);
}

function toggleOrderInfo(e) {
  const classNameHidden = "all-order-info-container--hidden";
  if (orderInfoContainer.classList.contains(classNameHidden)) {
    orderInfoContainer.classList.remove(classNameHidden);
    orderInfoContainer.addEventListener("click", toggleOrderInfo);
    document.body.style.overflow = "hidden";
    return;
  }

  if (e.target == orderInfoContainer || e.target == closeOrderInfoBtn) {
    orderInfoContainer.classList.add(classNameHidden);
    orderInfoContainer.removeEventListener("click", toggleOrderInfo);
    document.body.style.overflow = "";
  }
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

async function buildOrderedItems(items) {
  const fragment = document.createDocumentFragment();
  for (var item of items) {
    const itemInfo = await fetchItemInfos(item.menuItemId);
    const { publicUrl } = supabase.getUrl("orderflow", itemInfo.imagePath);

    const orderCard = document.createElement("order-card");
    orderCard.setAttribute("name", itemInfo.name);
    orderCard.setAttribute("quantity", item.quantity);
    orderCard.setAttribute("imgPath", publicUrl);
    if (item.notes) {
      orderCard.setAttribute("notes", true);
    }
    orderCard.setAttribute("data-id", item.id);
    orderCard.setAttribute("data-time", item.createdAt);
    fragment.appendChild(orderCard);
  }

  return fragment;
}

async function renderOrderedPendingItems() {
  orderedItemsContainer.innerHTML = "";

  if (ordersPending.length === 0) {
    orderedItemsContainer.innerHTML = `<p class="orders-none">Nenhum pedido pendente!</p>`;
    return;
  }
  const orderedItemsFragment = await buildOrderedItems(ordersPending);
  orderedItemsContainer.append(orderedItemsFragment);
}

async function renderOrderedInProgressItems() {
  ordersInProgressContainer.innerHTML = "";

  if (ordersInProgress.length === 0) {
    ordersInProgressContainer.innerHTML = `<p class="orders-none">Nenhum pedido em andamento!</p>`;
    return;
  }
  const orderedItemsFragment = await buildOrderedItems(ordersInProgress);
  ordersInProgressContainer.append(orderedItemsFragment);
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

async function setupMenuPage() {
  try {
    const orderedItems = await fetchOrderedItems();
    orderedItems.map((item) => {
      if (item.status === "pending") {
        ordersPending.push(item);
      } else if (item.status === "in_progress") {
        ordersInProgress.push(item);
      }
    });

    renderOrderedPendingItems();
    renderOrderedInProgressItems();

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

setupMenuPage();

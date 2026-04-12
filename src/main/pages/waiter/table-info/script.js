import "/waiter/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import "/components/order-card.js";
import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const urlParams = new URLSearchParams(window.location.search);
const pathParts = window.location.pathname.split("/");
const tableId = pathParts[2];
const tableNumber = urlParams.get("n");

const snackbar = document.querySelector("#snackbar");
const navbar = document.querySelector("#navBar");
const searchBar = document.querySelector("#search");
const ordersTitle = document.querySelector("#ordersTitle");
const statusSelect = document.querySelector("#statusSelect");
const readyOrdersContainer = document.querySelector("#readyOrders");
const inProgressOrdersContainer = document.querySelector("#inProgressOrders");
const pendingOrdersContainer = document.querySelector("#pendingOrders");
const deliveredOrdersContainer = document.querySelector("#deliveredOrders");
const readyOrdersSection = readyOrdersContainer.parentElement;
const inProgressOrdersSection = inProgressOrdersContainer.parentElement;
const pendingOrdersSection = pendingOrdersContainer.parentElement;
const deliveredOrdersSection = deliveredOrdersContainer.parentElement;
const allOrdersContainer = document.querySelector(".orders");
const orderInfoContainer = document.querySelector("#orderInfoContainer");
const orderPrincipalActionBtn = document.querySelector("#orderPrincipalAction");
const closeOrderInfoBtn = document.querySelector("#closeOrderInfoBtn");

const orderInfoTimer = document.querySelector("#orderTime");
const orderInfoImg = document.querySelector("#orderImg");
const orderInfoName = document.querySelector("#orderName");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");
const orderInfoIngridients = document.querySelector("#orderIngredients");

let orderGroups = [];
let allOrders = [];
let ordersPending = [];
let ordersInProgress = [];
let ordersReady = [];
let ordersDelivered = [];
let orderTimers = [];
let intervalId;
let specificIntervalId;

allOrdersContainer.addEventListener("click", showOrderInfo);
statusSelect.addEventListener("change", (e) =>
  renderOrders(searchBar.value, e.target.value),
);
searchBar.addEventListener("input", (e) =>
  renderOrders(e.target.value, statusSelect.value),
);

function calculateTimePassed(time) {
  const totalSeconds = Math.floor((Date.now() - new Date(time)) / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function sortByCreatedAt(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}

function organizeOrdersInArray() {
  const grouped = {
    pending: [],
    in_progress: [],
    ready: [],
    delivered: [],
  };

  allOrders.forEach((order) => {
    if (grouped[order.status]) {
      grouped[order.status].push(order);
    }
  });

  Object.values(grouped).forEach((orders) => orders.sort(sortByCreatedAt));

  ordersReady = grouped.ready;
  ordersInProgress = grouped.in_progress;
  ordersPending = grouped.pending;
  ordersDelivered = grouped.delivered;
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

async function fetchTableItems() {
  const res = await fetch(`${API_URL}/api/v1/table/${tableId}/item`);

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const tableItems = await res.json();
  return tableItems;
}

function buildOrderedItems(items) {
  const fragment = document.createDocumentFragment();

  for (let item of items) {
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
  let order = allOrders.find(
    (order) => order.id === orderInfoContainer.dataset.order_id,
  );
  if (!order) return;

  const createdAt = order.createdAt;

  const timePassedString = calculateTimePassed(createdAt);
  orderInfoTimer.innerText = `Tempo: ${timePassedString}`;

  if (specificIntervalId) clearInterval(specificIntervalId);

  specificIntervalId = setInterval(() => {
    const currentTimePassedString = calculateTimePassed(createdAt);
    orderInfoTimer.innerText = `Tempo: ${currentTimePassedString}`;
  }, 1000);
}

function getVisiblesStatuses(selectedStatus) {
  return (
    {
      everything: new Set(["ready", "in_progress", "pending", "delivered"]),
      pending: new Set(["pending"]),
      in_progress: new Set(["in_progress"]),
      ready: new Set(["ready"]),
      delivered: new Set(["delivered"]),
    }[selectedStatus] ?? new Set()
  );
}

function renderOrders(searchText = "", selectedStatus = "everything") {
  const text = searchText.toLowerCase().trim();
  const visibleStatuses = getVisiblesStatuses(selectedStatus);

  organizeOrdersInArray();
  orderGroups = [
    {
      orders: ordersReady,
      status: "ready",
      section: readyOrdersSection,
      container: readyOrdersContainer,
      emptyText: "Nenhum pedido pronto!",
    },
    {
      orders: ordersInProgress,
      status: "in_progress",
      section: inProgressOrdersSection,
      container: inProgressOrdersContainer,
      emptyText: "Nenhum pedido em andamento!",
    },
    {
      orders: ordersPending,
      status: "pending",
      section: pendingOrdersSection,
      container: pendingOrdersContainer,
      emptyText: "Nenhum pedido pendente!",
    },
    {
      orders: ordersDelivered,
      status: "delivered",
      section: deliveredOrdersSection,
      container: deliveredOrdersContainer,
      emptyText: "Nenhum pedido entregue!",
    },
  ];

  orderGroups.forEach(({ orders, status, container, section, emptyText }) => {
    const filteredOrders = orders.filter((order) =>
      order.name.toLowerCase().includes(text),
    );

    const hasOrders = orders.length > 0;
    const hasOrdersFiltered = filteredOrders.length > 0;
    const onlyOneStatus = visibleStatuses.size === 1;
    const statusIsVisible = visibleStatuses.has(status);

    section.classList.toggle("orders-section--hidden", !statusIsVisible);
    section.classList.toggle("orders-section--no-border", onlyOneStatus);

    if (hasOrdersFiltered) {
      container.replaceChildren(buildOrderedItems(filteredOrders));
    } else {
      if (!hasOrdersFiltered && hasOrders) {
        container.innerHTML = `<p class="orders-none">Nenhum pedido encontrado</p>`;
      } else {
        container.innerHTML = `<p class="orders-none">${emptyText}</p>`;
      }
    }
  });

  configTimers();
}

function closeOrderInfo(e) {
  if (e.target === orderInfoContainer || e.target === closeOrderInfoBtn) {
    hideOrderInfo();
  }
}

function showOrderInfo(e) {
  let order = e.target.closest("order-card");
  if (!order) return;

  const orderInfo = allOrders.find((item) => item.id === order.dataset.id);
  if (!orderInfo) return;

  orderInfoContainer.dataset.order_id = orderInfo.id;
  orderInfoImg.src = order.getAttribute("imgPath");
  orderInfoName.innerText = order.getAttribute("name");
  orderInfoQuantity.innerText = `Quantidade: ${orderInfo.quantity}`;

  orderInfoNotes.hidden = !orderInfo.notes;
  if (orderInfo.notes) orderInfoNotes.innerText = orderInfo.notes;

  orderInfoIngridients.hidden = !orderInfo.ingridients;
  if (orderInfo.ingridients)
    orderInfoIngridients.innerText = orderInfo.ingridients;

  orderInfoContainer.classList.remove("all-order-info-container--hidden");

  if (orderInfo.status === "ready") {
    orderPrincipalActionBtn.innerText = "Entregue!";
    orderPrincipalActionBtn.onclick = setOrderToDelivered;
  } else if (orderInfo.status === "delivered") {
    orderPrincipalActionBtn.innerText = "Voltar para pronto";
    orderPrincipalActionBtn.onclick = setOrderToReady;
  } else {
    orderPrincipalActionBtn.innerText = "Cancelar pedido";
    orderPrincipalActionBtn.onclick = setOrderToCancelled;
  }

  orderInfoContainer.addEventListener("click", closeOrderInfo);
  document.body.style.overflow = "hidden";

  configOrderInfoTimer();
}

function hideOrderInfo() {
  orderInfoContainer.classList.add("all-order-info-container--hidden");
  orderInfoContainer.removeEventListener("click", closeOrderInfo);
  document.body.style.overflow = "";
}

function getOrderItem(orderId) {
  if (!orderId) return;

  const itemIndex = allOrders.findIndex((item) => item.id === orderId);
  if (itemIndex == -1) return;
  const item = allOrders[itemIndex];

  return {
    item,
    itemIndex,
  };
}

async function updateOrderStatus(newStatus, item) {
  await fetch(`${API_URL}/api/v1/table/${item.tableId}/item/${item.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: newStatus,
    }),
  });
}

async function setOrderToReady() {
  const { item, itemIndex } = getOrderItem(orderInfoContainer.dataset.order_id);

  try {
    await updateOrderStatus("ready", item);

    allOrders[itemIndex].status = "ready";

    renderOrders();

    hideOrderInfo();
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Entregue"</p>');
  }
}

async function setOrderToDelivered() {
  const orderData = getOrderItem(orderInfoContainer.dataset.order_id);
  if (!orderData) return;

  const { item, itemIndex } = orderData;

  try {
    await updateOrderStatus("delivered", item);

    allOrders[itemIndex].status = "delivered";

    renderOrders();

    hideOrderInfo();
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Entregue"</p>');
  }
}

async function setOrderToCancelled() {
  const { item, itemIndex } = getOrderItem(orderInfoContainer.dataset.order_id);

  try {
    await updateOrderStatus("cancelled", item);

    allOrders.splice(itemIndex, 1);

    renderOrders();

    hideOrderInfo();

    snackbar.show("btn", "Deseja voltar a ação que fez?", {
      label: "Reverter",
      action: async () => {
        try {
          await updateOrderStatus(item.status, item);

          allOrders.push(item);

          renderOrders();
        } catch (err) {
          console.error(err);
          snackbar.show("error", "<p>Erro ao passar para 'Em Progresso'</p>");
        }
      },
    });
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Cancelado"</p>');
  }
}

async function setupOrdersPage() {
  try {
    const tableOrderedItems = await fetchTableItems();

    ordersTitle.innerText += ` (Mesa ${tableNumber})`;

    await Promise.all(
      tableOrderedItems.map(async (item) => {
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, tableId, name, imagePath };

        allOrders.push(enrichedItem);
      }),
    );

    renderOrders();

    document
      .querySelectorAll(".orders-section__items-skeleton")
      .forEach((el) => {
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
navbar.firstElementChild.children[2].classList.add("navbar__item--selected");

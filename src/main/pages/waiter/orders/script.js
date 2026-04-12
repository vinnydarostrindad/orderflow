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
const readyOrdersContainer = document.querySelector("#readyOrders");
const inProgressOrdersContainer = document.querySelector("#inProgressOrders");
const pendingOrdersContainer = document.querySelector("#pendingOrders");
const readyOrdersSection = readyOrdersContainer.parentElement;
const inProgressOrdersSection = inProgressOrdersContainer.parentElement;
const pendingOrdersSection = pendingOrdersContainer.parentElement;
const allOrdersContainer = document.querySelector(".orders");
const orderInfoContainer = document.querySelector("#orderInfoContainer");
const orderPrincipalActionBtn = document.querySelector("#orderPrincipalAction");
const closeOrderInfoBtn = document.querySelector("#closeOrderInfoBtn");

const orderInfoTimer = document.querySelector("#orderTime");
const orderInfoImg = document.querySelector("#orderImg");
const orderInfoName = document.querySelector("#orderName");
const orderInfoTable = document.querySelector("#orderTable");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");
const orderInfoIngridients = document.querySelector("#orderIngredients");

let allOrderItems = [];
let pendingOrderItems = [];
let inProgressOrderItems = [];
let readyOrderItems = [];
let orderItemGroups = [];
let orderItemTimers = [];
let intervalId;
let specificIntervalId;

allOrdersContainer.addEventListener("click", showOrderInfo);
statusSelect.addEventListener("change", filterOrders);
searchBar.addEventListener("input", search);

function search(e) {
  renderOrders(e.target.value, statusSelect.value);
}

function filterOrders(e) {
  renderOrders(searchBar.value, e.target.value);
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

function sortByCreatedAt(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}

function organizeOrderItemsInArray() {
  const grouped = {
    pending: [],
    in_progress: [],
    ready: [],
  };

  allOrderItems.forEach((orderItem) => {
    if (grouped[orderItem.status]) {
      grouped[orderItem.status].push(orderItem);
    }
  });

  Object.values(grouped).forEach((orderItems) =>
    orderItems.sort(sortByCreatedAt),
  );

  readyOrderItems = grouped.ready;
  inProgressOrderItems = grouped.in_progress;
  pendingOrderItems = grouped.pending;
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

  for (let item of items) {
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
  let orderItem = allOrderItems.find((item) => item.id === orderItemId);
  if (!orderItem) return;

  const createdAt = orderItem.createdAt;

  const timePassedString = calculateTimePassed(createdAt);
  orderInfoTimer.innerText = `Tempo: ${timePassedString}`;

  if (specificIntervalId) clearInterval(specificIntervalId);

  specificIntervalId = setInterval(() => {
    const currentTimePassedString = calculateTimePassed(createdAt);
    orderInfoTimer.innerText = `Tempo: ${currentTimePassedString}`;
  }, 1000);
}

function getVisibleStatuses(selectedStatus) {
  return (
    {
      everything: new Set(["ready", "in_progress", "pending"]),
      pending: new Set(["pending"]),
      in_progress: new Set(["in_progress"]),
      ready: new Set(["ready"]),
    }[selectedStatus] ?? new Set()
  );
}

function renderOrders(searchText = "", selectedStatus = "everything") {
  const text = searchText.toLowerCase().trim();
  const visibleStatuses = getVisibleStatuses(selectedStatus);

  organizeOrderItemsInArray();
  orderItemGroups = [
    {
      status: "ready",
      orderItems: readyOrderItems,
      section: readyOrdersSection,
      container: readyOrdersContainer,
      emptyText: "Nenhum pedido pronto!",
    },
    {
      status: "in_progress",
      orderItems: inProgressOrderItems,
      section: inProgressOrdersSection,
      container: inProgressOrdersContainer,
      emptyText: "Nenhum pedido em andamento!",
    },
    {
      status: "pending",
      orderItems: pendingOrderItems,
      section: pendingOrdersSection,
      container: pendingOrdersContainer,
      emptyText: "Nenhum pedido pendente!",
    },
  ];

  orderItemGroups.forEach(
    ({ orderItems, status, container, section, emptyText }) => {
      const filteredOrderItems = orderItems.filter((item) =>
        item.name.toLowerCase().includes(text),
      );

      const hasOrderItems = orderItems.length > 0;
      const hasFilteredOrderItems = filteredOrderItems.length > 0;
      const onlyOneStatus = visibleStatuses.size === 1;
      const statusIsVisible = visibleStatuses.has(status);

      section.classList.toggle("orders-section--hidden", !statusIsVisible);
      section.classList.toggle("orders-section--no-border", onlyOneStatus);

      if (hasFilteredOrderItems) {
        container.replaceChildren(buildOrderedItems(filteredOrderItems));
      } else {
        if (!hasFilteredOrderItems && hasOrderItems) {
          container.innerHTML = `<p class="orders-none">Nenhum pedido encontrado</p>`;
        } else {
          container.innerHTML = `<p class="orders-none">${emptyText}</p>`;
        }
      }
    },
  );

  configTimers();
}

function closeOrderInfo(e) {
  if (e.target === orderInfoContainer || e.target === closeOrderInfoBtn) {
    hideOrderInfo();
  }
}

function hideOrderInfo() {
  orderInfoContainer.classList.add("all-order-info-container--hidden");
  orderInfoContainer.removeEventListener("click", closeOrderInfo);
  document.body.style.overflow = "";
}

function showOrderInfo(e) {
  let orderCard = e.target.closest("order-card");
  if (!orderCard) return;

  const orderItemInfo = allOrderItems.find(
    (item) => item.id == orderCard.dataset.id,
  );
  if (!orderItemInfo) return;

  orderInfoContainer.dataset.orderItemId = orderItemInfo.id;
  orderInfoImg.src = orderCard.getAttribute("imgPath");
  orderInfoName.innerText = orderCard.getAttribute("name");
  orderInfoTable.innerText = `Mesa ${orderCard.getAttribute("table")}`;
  orderInfoQuantity.innerText = `Quantidade: ${orderItemInfo.quantity}`;

  if (orderItemInfo.notes) {
    orderInfoNotes.hidden = false;
    orderInfoNotes.innerText = orderItemInfo.notes;
  } else {
    orderInfoNotes.hidden = true;
  }

  if (orderItemInfo.ingredients) {
    orderInfoIngridients.hidden = false;
    orderInfoIngridients.innerText = orderItemInfo.ingredients;
  } else {
    orderInfoIngridients.hidden = true;
  }

  orderInfoContainer.classList.remove("all-order-info-container--hidden");

  if (orderItemInfo.status === "ready") {
    orderPrincipalActionBtn.innerText = "Entregue!";
    orderPrincipalActionBtn.onclick = setOrderToDelivered;
  } else {
    orderPrincipalActionBtn.innerText = "Cancelar pedido";
    orderPrincipalActionBtn.onclick = setOrderToCancelled;
  }

  orderInfoContainer.addEventListener("click", closeOrderInfo);
  document.body.style.overflow = "hidden";

  configOrderInfoTimer();
}

function getOrderItemById(orderItemId) {
  if (!orderItemId) return;

  const itemIndex = allOrderItems.findIndex((item) => item.id === orderItemId);
  if (itemIndex === -1) return;
  const item = allOrderItems[itemIndex];

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

async function setOrderToDelivered() {
  const orderItemData = getOrderItemById(
    orderInfoContainer.dataset.orderItemId,
  );
  if (!orderItemData) return;

  const { item, itemIndex } = orderItemData;

  try {
    await updateOrderStatus("delivered", item);

    allOrderItems[itemIndex].status = "delivered";

    renderOrders(searchBar.value, statusSelect.value);
    hideOrderInfo();
  } catch (err) {
    console.error(err);
    snackbar.show("error", '<p>Erro ao passar para "Entregue"</p>');
  }
}

async function setOrderToCancelled() {
  const orderItemData = getOrderItemById(
    orderInfoContainer.dataset.orderItemId,
  );
  if (!orderItemData) return;

  const { item, itemIndex } = orderItemData;

  try {
    await updateOrderStatus("cancelled", item);

    allOrderItems.splice(itemIndex, 1);

    renderOrders(searchBar.value, statusSelect.value);
    hideOrderInfo();

    snackbar.show("btn", "Deseja voltar a ação que fez?", {
      label: "Reverter",
      action: async () => {
        try {
          await updateOrderStatus(item.status, item);

          allOrderItems.push(item);

          renderOrders(searchBar.value, statusSelect.value);
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
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, name, imagePath };

        allOrderItems.push(enrichedItem);
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
navbar.firstElementChild.children[1].classList.add("navbar__item--selected");

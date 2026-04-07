import "/cashier/components/nav/script.js";
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
const searchBar = document.querySelector("#search");
const ordersTitle = document.querySelectorAll(".title");
const paymentDetails = document.querySelector("#paymentDetailsList");
const totalPrice = document.querySelector("#totalPrice");
const paymentMethods = document.querySelector("#paymentMethods");
const paymentOptionsMarkers = document.querySelectorAll(
  ".payment__option__marker",
);
const confirmPaymentForm = document.querySelector("#confirmPayment");
const ordersContainer = document.querySelector("#orders");
const allOrdersSection = document.querySelector(".orders");
const orderInfoContainer = document.querySelector("#orderInfoContainer");
const setOrderToCancelledBtn = document.querySelector("#setOrderToCancelled");
const closeOrderInfoBtn = document.querySelector("#closeOrderInfoBtn");
const toggleOrderInPaymentBtn = document.querySelector("#toggleOrderInPayment");

const orderInfoImg = document.querySelector("#orderImg");
const orderInfoName = document.querySelector("#orderName");
const orderInfoQuantity = document.querySelector("#orderQuantity");
const editQuantityContainer = document.querySelector("#editQuantityContainer");
const editQuantityBtn = document.querySelector("#editQuantity");
const saveQuantityContainer = document.querySelector("#saveQuantityContainer");
const quantityInput = document.querySelector("#quantity");
const saveQuantityBtn = document.querySelector("#saveQuantity");
const orderInfoNotes = document.querySelector("#orderNotes");

let allOrders = [];
const removedFromPaymentIds = new Set();
let orderInFocus = null;

searchBar.addEventListener("input", (e) => renderOrders(e.target.value));
paymentMethods.addEventListener("change", paymentOptionsToggle);
confirmPaymentForm.addEventListener("submit", confirmPayment);
allOrdersSection.addEventListener("click", showOrderInfo);
editQuantityBtn.addEventListener("click", editQuantity);
saveQuantityBtn.addEventListener("click", saveQuantity);
setOrderToCancelledBtn.addEventListener("click", setOrderToCancelled);
toggleOrderInPaymentBtn.addEventListener("click", toggleOrderInPayment);

function normalizeOrderId(orderId) {
  return String(orderId);
}

function isOrderIncludedInPayment(orderId) {
  return !removedFromPaymentIds.has(normalizeOrderId(orderId));
}

function getOrdersIncludedInPayment() {
  return allOrders.filter((order) => isOrderIncludedInPayment(order.id));
}

function updateToggleOrderInPaymentButton(orderId) {
  const isIncluded = isOrderIncludedInPayment(orderId);

  toggleOrderInPaymentBtn.innerText = isIncluded
    ? "Retirar deste pagamento"
    : "Adicionar neste pagamento";

  toggleOrderInPaymentBtn.classList.toggle(
    "all-order-info__toggle-payment-btn--remove",
    isIncluded,
  );

  toggleOrderInPaymentBtn.classList.toggle(
    "all-order-info__toggle-payment-btn--add",
    !isIncluded,
  );
}

function editQuantity(e) {
  quantityInput.value = e.target.closest(
    "#orderInfoContainer",
  ).dataset.quantity;

  editQuantityContainer.classList.add("all-order-info__quantity-group--hidden");
  saveQuantityContainer.classList.remove(
    "all-order-info__quantity-group--hidden",
  );
}

async function saveQuantity(e) {
  const item = allOrders.find(
    (order) =>
      order.id === e.target.closest("#orderInfoContainer").dataset.order_id,
  );
  if (item.quantity === quantityInput.value) return;
  const quant = quantityInput.value;

  try {
    await fetch(
      `${API_URL}/api/v1/table/${item.tableId}/order/${item.orderId}/item/${item.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: quant,
        }),
      },
    );

    orderInfoQuantity.innerText = `Quantidade: ${quant}`;
    item.quantity = quant;
    item.totalPrice = item.unitPrice * quant;
    renderOrders();
  } catch (err) {
    console.error(err);
    snackbar.show(
      "error",
      "<p>Error editar quantidade. <br> Tente novamente!</p>",
    );
  }

  saveQuantityContainer.classList.add("all-order-info__quantity-group--hidden");
  editQuantityContainer.classList.remove(
    "all-order-info__quantity-group--hidden",
  );

  buildOrderPayment();
}

function paymentOptionsToggle(e) {
  paymentOptionsMarkers.forEach((marker) => {
    marker.classList.remove("payment__option__marker--marked");
  });
  const marker = e.currentTarget.querySelector(
    'input[name="paymentMethod"]:checked',
  );

  marker.previousElementSibling.classList.add(
    "payment__option__marker--marked",
  );
}

function confirmPayment(e) {
  e.preventDefault();
  const dados = new FormData(confirmPaymentForm);
  const valorRadio = dados.get("paymentMethod");
  console.log(valorRadio);
}

function sortByCreatedAt(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}

function organizeOrdersInArray() {
  allOrders.sort(sortByCreatedAt);
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

async function fetchTableOrders() {
  const res = await fetch(`${API_URL}/api/v1/table/${tableId}/order`);

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const tableOrderedItems = await res.json();
  return tableOrderedItems;
}

async function fetchTableOrderedItems(tableOrders) {
  let allOrderItems = [];
  await Promise.all(
    tableOrders.map(async (order) => {
      const res = await fetch(
        `${API_URL}/api/v1/table/${tableId}/order/${order.id}/item`,
      );

      if (!res.ok) {
        throw {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
        };
      }

      const tableOrderedItems = await res.json();
      allOrderItems.push(tableOrderedItems[0]);
    }),
  );

  return allOrderItems;
}

function buildOrderedItems(items) {
  const fragment = document.createDocumentFragment();

  for (let item of items) {
    const { publicUrl } = supabase.getUrl("orderflow", item.imagePath);
    const isIncludedInPayment = isOrderIncludedInPayment(item.id);

    const orderCard = document.createElement("order-card");

    if (isIncludedInPayment) {
      orderCard.setAttribute("selected", "");
    }
    orderCard.setAttribute("name", item.name);
    orderCard.setAttribute("quantity", item.quantity);
    orderCard.setAttribute("imgPath", publicUrl);
    if (item.notes) orderCard.setAttribute("notes", true);
    if (item.maxTime) orderCard.setAttribute("data-max_time", item.id);
    orderCard.setAttribute("data-id", item.id);
    orderCard.setAttribute(
      "data-payment-label",
      isIncludedInPayment ? "Adicionado" : "Não adicionado",
    );
    fragment.appendChild(orderCard);
  }

  return fragment;
}

function renderOrders(searchText = "") {
  const text = searchText.toLowerCase().trim();

  organizeOrdersInArray();

  const filteredOrders = allOrders.filter((order) =>
    order.name.toLowerCase().includes(text),
  );

  const hasOrders = allOrders.length > 0;
  const hasOrdersFiltered = filteredOrders.length > 0;

  if (hasOrdersFiltered) {
    ordersContainer.replaceChildren(buildOrderedItems(filteredOrders));
  } else {
    if (!hasOrdersFiltered && hasOrders) {
      ordersContainer.innerHTML = `<p class="orders-none">Nenhum pedido encontrado</p>`;
    } else {
      ordersContainer.innerHTML = `<p class="orders-none">Nenhum pedido foi feito</p>`;
    }
  }
}

function closeOrderInfo(e) {
  if (e.target === orderInfoContainer || e.target === closeOrderInfoBtn) {
    orderInFocus = null;
    hideOrderInfo();
  }
}

function showOrderInfo(e) {
  let order = e.target.closest("order-card");
  if (!order) return;

  orderInFocus = order;

  const orderInfo = allOrders.find((item) => item.id === order.dataset.id);
  if (!orderInfo) return;

  orderInfoContainer.dataset.order_id = orderInfo.id;
  orderInfoContainer.dataset.quantity = orderInfo.quantity;
  orderInfoImg.src = order.getAttribute("imgPath");
  orderInfoName.innerText = order.getAttribute("name");
  orderInfoQuantity.innerText = `Quantidade: ${orderInfo.quantity}`;

  orderInfoNotes.hidden = !orderInfo.notes;
  if (orderInfo.notes) orderInfoNotes.innerText = orderInfo.notes;
  updateToggleOrderInPaymentButton(orderInfo.id);

  orderInfoContainer.classList.remove("all-order-info-container--hidden");

  orderInfoContainer.addEventListener("click", closeOrderInfo);
  document.body.style.overflow = "hidden";
}

function toggleOrderInPayment() {
  const orderId = orderInfoContainer.dataset.order_id;
  if (!orderId) return;

  const normalizedOrderId = normalizeOrderId(orderId);
  console.log(orderInFocus);

  if (removedFromPaymentIds.has(normalizedOrderId)) {
    orderInFocus.removeAttribute("selected");
    removedFromPaymentIds.delete(normalizedOrderId);
  } else {
    orderInFocus.setAttribute("selected", "");
    removedFromPaymentIds.add(normalizedOrderId);
  }

  updateToggleOrderInPaymentButton(normalizedOrderId);
  buildOrderPayment();
  renderOrders(searchBar.value);
}

function hideOrderInfo() {
  orderInfoContainer.classList.add("all-order-info-container--hidden");
  orderInfoContainer.removeEventListener("click", closeOrderInfo);
  document.body.style.overflow = "";
  editQuantityContainer.classList.remove(
    "all-order-info__quantity-group--hidden",
  );
  saveQuantityContainer.classList.add("all-order-info__quantity-group--hidden");
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
  await fetch(
    `${API_URL}/api/v1/table/${item.tableId}/order/${item.orderId}/item/${item.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    },
  );
}

async function setOrderToCancelled() {
  const { item, itemIndex } = getOrderItem(orderInfoContainer.dataset.order_id);

  try {
    await updateOrderStatus("cancelled", item);
    removedFromPaymentIds.delete(normalizeOrderId(item.id));

    allOrders.splice(itemIndex, 1);

    buildOrderPayment();
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

function buildDetailsList() {
  organizeOrdersInArray();

  let listItemsFrag = document.createDocumentFragment();
  const includedOrders = getOrdersIncludedInPayment();

  let brlFormat = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  includedOrders.forEach((order) => {
    let li = document.createElement("li");

    if (order.quantity === "1") {
      li.innerText = `${order.name} 1x: ${brlFormat.format(order.totalPrice)}`;
    } else {
      li.innerText = `${order.name} ${order.quantity}x: ${brlFormat.format(order.totalPrice)} | Uni.: ${brlFormat.format(order.unitPrice)}`;
    }

    listItemsFrag.append(li);
  });

  return listItemsFrag;
}

function buildOrderPayment() {
  const includedOrders = getOrdersIncludedInPayment();

  const totalPriceValue = includedOrders.reduce((acc, order) => {
    return acc + Number(order.totalPrice);
  }, 0);

  totalPrice.innerText = totalPriceValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  paymentDetails.replaceChildren(buildDetailsList());
}

async function setupOrdersPage() {
  try {
    const tableOrders = await fetchTableOrders();
    const tableOrderedItems = await fetchTableOrderedItems(tableOrders);

    ordersTitle.forEach((title) => {
      title.innerText += ` (Mesa ${tableNumber})`;
    });

    await Promise.all(
      tableOrderedItems.map(async (item) => {
        const { name, imagePath } = await fetchItemInfos(item.menuItemId);

        const enrichedItem = { ...item, tableId, name, imagePath };

        allOrders.push(enrichedItem);
      }),
    );

    buildOrderPayment();
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

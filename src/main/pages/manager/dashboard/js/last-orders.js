import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const carouselLeftBtn = document.querySelector("#carouselLeftBtn");
const carouselRightBtn = document.querySelector("#carouselRightBtn");
const ordersBox = document.querySelector("#lastOrders");
const snackbar = document.querySelector("#snackbar");

let orderTimeIntervalId;
let currentTranslateX = 0;
let orderElements = [];
let visibleOrdersCount;
let orderedItems = [];
let orderedMenuItems = [];

const breakpoints = [
  window.matchMedia("(width < 680px)"),
  window.matchMedia("(width >= 680px)"),
  window.matchMedia("(width >= 1060px)"),
  window.matchMedia("(width >= 1420px)"),
];
breakpoints.forEach((bp) => bp.addEventListener("change", organizeCarousel));

carouselLeftBtn.addEventListener("click", moveLastOrders);
carouselRightBtn.addEventListener("click", moveLastOrders);

function calculateTimePassed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function toggleCarouselButton(btn, enabled, changeOpacity = true) {
  btn.style.opacity = changeOpacity ? (enabled ? "" : 0) : "";
  btn.disabled = !enabled;
}

function moveLastOrders(e) {
  const ordersGap = 19.2;
  const ordersWidth = 216;
  const btn = e.target.closest("button");
  const step = Math.floor(ordersWidth + ordersGap);

  if (btn.id === "carouselRightBtn") {
    currentTranslateX -= step;
    const rightLimit = -((orderElements.length - visibleOrdersCount) * step);

    if (currentTranslateX <= rightLimit) {
      toggleCarouselButton(carouselRightBtn, false, false);
    }
    toggleCarouselButton(carouselLeftBtn, true, false);
  } else {
    currentTranslateX += step;

    if (currentTranslateX >= 0) {
      currentTranslateX = 0;
      toggleCarouselButton(carouselLeftBtn, false, false);
    }

    toggleCarouselButton(carouselRightBtn, true, false);
  }

  ordersBox.style.translate = `${currentTranslateX}px`;
}

function organizeCarousel(e) {
  if (!ordersBox.parentElement) return;

  if (e?.type === "change") {
    ordersBox.style.translate = 0;
    currentTranslateX = 0;
  }

  visibleOrdersCount = Math.floor(
    ordersBox.parentElement.clientWidth / orderElements[0].offsetWidth,
  );

  if (orderElements.length - visibleOrdersCount <= 0) {
    toggleCarouselButton(carouselRightBtn, false);
    toggleCarouselButton(carouselLeftBtn, false);
    ordersBox.style.justifyContent = "center";
    return;
  } else {
    toggleCarouselButton(carouselRightBtn, true);
    toggleCarouselButton(carouselLeftBtn, false, false);
    ordersBox.style.justifyContent = "start";
  }
}

function setLastOrdersTimer() {
  const lastOrdersTime = document.querySelectorAll(".order-time");
  if (orderTimeIntervalId) clearInterval(orderTimeIntervalId);

  orderTimeIntervalId = setInterval(() => {
    lastOrdersTime.forEach((timer) => {
      timer.textContent = calculateTimePassed(
        Date.now() - timer.dataset.createdAt,
      );
    });
  }, 1000);
}

function renderLastOrdersHTML(orderedItemsInfos) {
  let renderedOrders = 0;
  ordersBox.innerHTML = "";

  orderedItemsInfos.forEach((item) => {
    for (let i = 0; i < +item.quantity; i++) {
      if (renderedOrders === 10) return;
      const createdAt = Date.parse(item.createdAt);

      const img = item.imagePath
        ? `<img src="${supabase.getUrl("menu-items-img", item.imagePath).publicUrl}" alt="${item.name}" />`
        : "";

      ordersBox.insertAdjacentHTML(
        "beforeend",
        `
          <div class="last-orders__order">
            <div>
              ${img}
              <h4>${item.name}</h4>
            </div>
            <div class="last-orders__info">
              <p class="last-orders__status">Status: ${item.status}</p>
              <p class="last-orders__table-number">Mesa: ${item.tableNumber}</p>
              <p class="last-orders__time">Tempo:
                <span class="order-time" data-created-at="${createdAt}">
                  ${calculateTimePassed(Date.now() - createdAt)}
                </span>
              </p>
            </div>
          </div>  
        `,
      );
      renderedOrders++;
    }
  });
}

async function getLastOrdersInfo() {
  const data = orderedItems.map((orderedItem) => {
    const menuItem = orderedMenuItems.find(
      (m) => m.id === orderedItem.menuItemId,
    );
    if (!menuItem) return;

    return {
      name: menuItem.name,
      quantity: orderedItem.quantity,
      imagePath: menuItem.imagePath,
      status: orderedItem.status,
      tableNumber: orderedItem.tableNumber,
      createdAt: orderedItem.createdAt,
    };
  });

  return data.filter(Boolean).reverse();
}

async function fetchTodayLastOrders() {
  try {
    const response = await fetch(`${API_URL}/api/v1/ordered-items?period=day`);
    return await response.json();
  } catch (error) {
    snackbar.show(
      "error",
      "<p>Erro ao tentar obter os últimos pedidos. <br> Tente novamente.</p>",
    );
    console.error(error);
    return [];
  }
}

async function showLastOrders(menuItems) {
  orderedItems = await fetchTodayLastOrders();
  orderedMenuItems = menuItems;

  const orderedItemsInfos = await getLastOrdersInfo();

  document.querySelector(".last-orders__skeletons")?.remove();
  ordersBox.innerHTML = "";

  if (orderedItems.length === 0) {
    ordersBox.innerHTML = `<p>Nenhum pedido foi feito hoje</p>`;
    carouselLeftBtn.style.opacity = 0;
    carouselLeftBtn.disabled = true;
    carouselRightBtn.style.opacity = 0;
    carouselRightBtn.disabled = true;
    return;
  }

  renderLastOrdersHTML(orderedItemsInfos);
  orderElements = document.querySelectorAll(".last-orders__order");

  organizeCarousel();
  setLastOrdersTimer();
}

export default showLastOrders;

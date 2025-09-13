import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const carouselLeftBtn = document.querySelector("#carouselLeftBtn");
const carouselRightBtn = document.querySelector("#carouselRightBtn");
const ordersBox = document.querySelector("#lastOrders");

let orderTimeIntervalId;
let currentTranslateX = 0;
let orderElements;
let visibleOrdersCount;
let orderedItems;
let orderedMenuItems;
const tablesNumberByOrderId = new Map();

const smQuery = window.matchMedia("(width < 680px)");
const mdQuery = window.matchMedia("(width >= 680px)");
const lgQuery = window.matchMedia("(width >= 1060px)");
const xlQuery = window.matchMedia("(width >= 1420px)");

carouselLeftBtn.addEventListener("click", moveLastOrders);
carouselRightBtn.addEventListener("click", moveLastOrders);
const breakpoints = [smQuery, mdQuery, lgQuery, xlQuery];
breakpoints.forEach((bp) => bp.addEventListener("change", organizeCarousel));

function toggleCarouselButton(btn, enabled, changeOpacity = true) {
  btn.style.opacity = "";
  if (changeOpacity) btn.style.opacity = enabled ? "" : 0;
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
  } else if (btn.id === "carouselLeftBtn") {
    currentTranslateX += step;

    if (currentTranslateX >= 0) {
      currentTranslateX = 0;
      toggleCarouselButton(carouselLeftBtn, false, false);
    }

    toggleCarouselButton(carouselRightBtn, true, false);
  }

  ordersBox.style.translate = currentTranslateX + "px";
}

function calculateTimePassed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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
    ordersBox.style.justifyContent = "none";
  }
}

function renderLastOrdersHTML(orderedItemsInfos) {
  let amountOfLastOrders = 0;
  ordersBox.innerHTML = "";
  orderedItemsInfos.forEach((item) => {
    for (let i = 0; i < +item.quantity; i++) {
      if (amountOfLastOrders === 10) return;
      const createdAt = Date.parse(item.createdAt);

      let img;
      if (item.imagePath) {
        const { publicUrl } = supabase.getUrl("menu-items-img", item.imagePath);
        img = `<img src="${publicUrl}" alt="${item.name}" />`;
      } else {
        img = "";
      }

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
          <p class="last-orders__time">Tempo: <span class="order-time" data-created-at="${createdAt}">${calculateTimePassed(Date.now() - createdAt)}</span></p>
        </div>
      </div>  
    `,
      );
      amountOfLastOrders++;
    }
  });
}

async function getLastOrdersInfo() {
  const data = [];

  for (let orderedItem of orderedItems) {
    const menuItem = orderedMenuItems.find(
      (orderedMenuItem) => orderedMenuItem.id === orderedItem.menuItemId,
    );
    if (!menuItem) return;

    if (!tablesNumberByOrderId.has(orderedItem.order)) {
      try {
        const orderResponse = await fetch(
          `${API_URL}/api/v1/order/${orderedItem.orderId}`,
        );

        if (!orderResponse.ok) {
          throw {
            status: orderResponse.status,
            statusText: orderResponse.statusText,
            url: orderResponse.url,
          };
        }

        const orderBody = await orderResponse.json();
        tablesNumberByOrderId.set(orderedItem.orderId, orderBody.tableNumber);

        data.push({
          name: menuItem.name,
          quantity: orderedItem.quantity,
          imagePath: menuItem.imagePath,
          status: orderedItem.status,
          tableNumber: orderBody.tableNumber,
          createdAt: orderedItem.createdAt,
        });
        continue;
      } catch (error) {
        console.error(error);
      }
    }

    data.push({
      name: menuItem.name,
      quantity: orderedItem.quantity,
      imagePath: menuItem.imagePath,
      status: orderedItem.status,
      tableNumber: tablesNumberByOrderId.get(orderedItem.orderId),
      createdAt: orderedItem.createdAt,
    });
  }

  const lastOrdersOrdered = data.filter(Boolean).reverse();
  return lastOrdersOrdered;
}

async function showLastOrders(items, menuItems) {
  orderedItems = items;
  orderedMenuItems = menuItems;
  const orderedItemsInfos = await getLastOrdersInfo();

  document.querySelector(".last-orders__skeletons")?.remove();

  if (!ordersBox.parentElement) return;

  if (orderedItemsInfos.length === 0) {
    ordersBox.parentElement.innerHTML = `<p>Nenhum pedido foi feito hoje</p>`;
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

function updateLastOrders(items, menuItems) {
  if (orderedItems.length === items.length) return;

  ordersBox.style.translate = 0;
  currentTranslateX = 0;

  showLastOrders(items, menuItems);
}

export { showLastOrders, updateLastOrders };

const params = new URLSearchParams(window.location.search);
const businessId = params.get("businessId");
const menuBtn = document.querySelector("#menuBtn");
const leftBtn = document.querySelector("#leftBtn");
const rightBtn = document.querySelector("#rightBtn");

menuBtn.addEventListener("click", toggleMenuBar);
leftBtn.addEventListener("click", moveLastOrders);
rightBtn.addEventListener("click", moveLastOrders);

function moveLastOrders(e) {
  const btn = e?.target.closest("button");
  const ordersBox = document.querySelector(".orders");
  const allOrders = document.querySelectorAll(".order");

  const ordersShown = Math.floor(
    ordersBox.parentElement.clientWidth / allOrders[0].offsetWidth,
  );

  let translateValue = getComputedStyle(ordersBox).translate;
  if ((allOrders.length - ordersShown) * 235 === 0) {
    document.querySelector("#rightBtn").style.opacity = 0;
  }
  if (btn.id == "rightBtn") {
    if (
      parseInt(translateValue) - 235 ===
      -((allOrders.length - ordersShown) * 235)
    ) {
      btn.style.opacity = 0;
    }
    if (parseInt(translateValue) === -((allOrders.length - ordersShown) * 235))
      return;

    leftBtn.style.opacity = 1;
    const newTraslateValue = parseInt(translateValue) - 235;
    ordersBox.style.translate = newTraslateValue + "px";
  } else {
    if (parseInt(translateValue) + 235 === 0) btn.style.opacity = 0;
    if (parseInt(translateValue) === 0) return;

    rightBtn.style.opacity = 1;
    const newTraslateValue = parseInt(translateValue) + 235;
    ordersBox.style.translate = newTraslateValue + "px";
  }
}

function toggleMenuBar() {
  const menuBar = document.querySelector("#menuBar");

  document.body.style.overflow = menuBar.classList.contains("hidden")
    ? "hidden"
    : "";
  menuBar.classList.toggle("hidden");
}

async function fetchOrderedItems() {
  const response = await fetch(
    `http://localhost:3000/api/v1/business/${businessId}/ordered-items`,
  );

  const orderedItems = await response.json();
  return orderedItems;
}

async function fetchOrderedMenuItems(orderedItems) {
  const orderedMenuItems = await Promise.all(
    orderedItems.map(async (orderedItem) => {
      const response = await fetch(
        `http://localhost:3000/api/v1/business/${businessId}/menu-item/${orderedItem.menuItemId}`,
      );
      return await response.json();
    }),
  );

  return orderedMenuItems;
}

// TextStats funcitons

async function showAmountOfOrders() {
  const ordersAmount = document.querySelector("#ordersAmount");

  const orderedItems = await fetchOrderedItems();

  let ordersAmountValue = 0;
  orderedItems.forEach((item) => {
    ordersAmountValue = +ordersAmountValue + +item.quantity;
  });

  ordersAmount.innerHTML = ordersAmountValue;
}

// Show last orders funciton

async function showLastOrders() {
  const orderedItems = await fetchOrderedItems();

  const orderedMenuItems = await fetchOrderedMenuItems(orderedItems);

  const orderedItemsInfos = getLastOrdersInfo(orderedItems, orderedMenuItems);

  const orders = document.querySelector("#lastOrders");
  if (orderedItemsInfos.length === 0) {
    orders.innerHTML = `<p>Nenhum pedido foi feito hoje</p>`;
    return;
  }

  let amountOflastOrders = 0;
  orders.innerHTML = "";
  orderedItemsInfos.forEach((item) => {
    if (amountOflastOrders === 10) return;
    for (let i = 0; i < +item.quantity; i++) {
      orders.insertAdjacentHTML(
        "beforeend",
        `
      <div class="order">
        <div>
          <img src="../${item.imagePath}" alt="${item.name}" />
          <h4>${item.name}</h4>
        </div>
        <div class="info">
          <p class="status">Status: ${item.status}</p>
          <p class="tableNumber">Mesa: ${item.tableNumber}</p>
          <p class="timeSinceOrder">Tempo: ${((Date.now() - Date.parse(item.createdAt)) / (1000 * 60)).toFixed(2)}</p>
        </div>
      </div>  
    `,
      );
      amountOflastOrders++;
    }
  });
  console.log(amountOflastOrders);
}

function getLastOrdersInfo(orderedItems, orderedMenuItems) {
  const orderedItemsInfos = orderedItems.map((orderedItem) => {
    for (let orderedMenuItem of orderedMenuItems) {
      if (orderedItem.menuItemId === orderedMenuItem.id) {
        return {
          name: orderedMenuItem.name,
          quantity: orderedItem.quantity,
          imagePath: orderedMenuItem.imagePath,
          status: orderedItem.status,
          tableNumber: orderedItem.tableNumber,
          createdAt: orderedItem.createdAt,
        };
      }
    }
  });

  return orderedItemsInfos.reverse();
}

// Make graphic functions

let salesChart;
let lastFetchTime;
async function makeGraphic() {
  const orderedItems = await fetchOrderedItems();

  const orderedMenuItems = await fetchOrderedMenuItems(orderedItems);
  lastFetchTime = Date.now();

  if (orderedItems.length === 0) {
    document.querySelector(".porcentage").innerText =
      "Nada foi vendido durante esse período";
    document.querySelector(".quantity").innerText = "";
    return;
  }

  const formatedOrderedItems = getInfosToMakeGraphic(
    orderedItems,
    orderedMenuItems,
  );

  const ctx = document.getElementById("salesChart").getContext("2d");
  // eslint-disable-next-line no-undef
  salesChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(formatedOrderedItems),
      datasets: [
        {
          data: Object.values(formatedOrderedItems),
          hoverOffset: 20,
        },
      ],
    },
    options: {
      responsive: false,
      layout: {
        padding: 20,
      },
      plugins: {
        legend: {
          position: "none",
        },
      },
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          const index = chartElement[0].index;
          const value = salesChart.data.datasets[0].data[index];

          const percentage = (
            (value /
              salesChart.data.datasets[0].data.reduce((a, b) => +a + +b)) *
            100
          ).toFixed(1);

          document.querySelector(".porcentage").innerText = `${percentage}%`;
          document.querySelector(".quantity").innerText = `(${value})`;
        } else {
          document.querySelector(".porcentage").innerText = "";
          document.querySelector(".quantity").innerText = "";
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    },
  });

  document.querySelector("canvas").onmouseleave = () => {
    document.querySelector(".porcentage").innerText = "";
    document.querySelector(".quantity").innerText = "";
  };
}

function getInfosToMakeGraphic(orderedItems, orderedMenuItems) {
  const orderedItemsInfos = orderedItems.map((orderedItem) => {
    for (let menuItem of orderedMenuItems) {
      if (menuItem.id === orderedItem.menuItemId) {
        return {
          quantity: orderedItem.quantity,
          type: menuItem.type,
        };
      }
    }
  });

  let formatedOrderedItems = {};
  for (let item of orderedItemsInfos) {
    if (formatedOrderedItems[item.type]) {
      formatedOrderedItems[item.type] = String(
        Number(formatedOrderedItems[item.type]) + Number(item.quantity),
      );
      continue;
    }
    formatedOrderedItems[item.type] = item.quantity;
  }
  return formatedOrderedItems;
}

async function updateGraphic() {
  const orderedItems = await fetchOrderedItems();
  const orderedMenuItems = await fetchOrderedMenuItems(orderedItems);

  const addedOrders = getInfosToUpdateGraphic(orderedItems, orderedMenuItems);
  lastFetchTime = Date.now();

  for (let order in addedOrders) {
    if (salesChart.data.labels.includes(order)) {
      const indexOfOrder = salesChart.data.labels.indexOf(order);

      const currentValue = Number(
        salesChart.data.datasets[0].data[indexOfOrder],
      );
      const addedValue = Number(addedOrders[order]);

      salesChart.data.datasets[0].data[indexOfOrder] =
        currentValue + addedValue;
    } else {
      salesChart.data.label.push(order);

      salesChart.data.datasets[0].data.push(addedOrders.order);
    }

    salesChart.update();
  }
}

function getInfosToUpdateGraphic(orderedItems, orderedMenuItems) {
  const orderedItemsInfos = orderedItems
    .map((orderedItem) => {
      for (let menuItem of orderedMenuItems) {
        if (menuItem.id === orderedItem.menuItemId) {
          if (Date.parse(orderedItem.createdAt) < lastFetchTime) continue;
          return {
            quantity: orderedItem.quantity,
            type: menuItem.type,
          };
        }
      }
    })
    .filter((elem) => elem !== undefined);

  let formatedOrderedItems = {};
  for (let item of orderedItemsInfos) {
    if (formatedOrderedItems[item.type]) {
      formatedOrderedItems[item.type] = String(
        Number(formatedOrderedItems[item.type]) + Number(item.quantity),
      );
      continue;
    }
    formatedOrderedItems[item.type] = item.quantity;
  }

  return formatedOrderedItems;
}

showAmountOfOrders();
makeGraphic();
showLastOrders();

setInterval(() => {
  console.log("Buscou");
  updateGraphic();
  showLastOrders();
  showAmountOfOrders();
}, 30000);

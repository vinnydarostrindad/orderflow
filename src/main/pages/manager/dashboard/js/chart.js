const chartPorcentage = document.querySelector("#chartPorcentage");
const chartQuantity = document.querySelector("#chartQuantity");
const ctx = document.getElementById("salesChart").getContext("2d");

let orderedItems;
let orderedMenuItems;
let salesChart;
let lastFetchTime;

function getInfosToMakeChart() {
  const menuItemsMap = new Map(orderedMenuItems.map((item) => [item.id, item]));

  const orderedItemsInfos = orderedItems.map((orderedItem) => {
    const menuItem = menuItemsMap.get(orderedItem.menuItemId);

    if (!menuItem) return;

    return {
      quantity: orderedItem.quantity,
      type: menuItem.type ? menuItem.type : "(Sem tipo)",
    };
  });

  const formatedOrderedItems = {};

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

function makeChart(items, menuItems, lastFetch) {
  orderedItems = items;
  orderedMenuItems = menuItems;
  lastFetchTime = lastFetch;

  document.querySelector(".chart-skeleton")?.remove();

  if (orderedItems.length === 0) {
    chartPorcentage.textContent = "Nada foi vendido durante esse período";
    chartQuantity.textContent = "";
    return;
  }

  const formatedOrderedItems = getInfosToMakeChart();

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

          chartPorcentage.innerText = `${percentage}%`;
          chartQuantity.innerText = `(${value})`;
        } else {
          chartPorcentage.innerText = "";
          chartQuantity.innerText = "";
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    },
  });

  document.querySelector("canvas").onmouseleave = () => {
    chartPorcentage.innerText = "";
    chartQuantity.innerText = "";
  };
}

function getInfosToUpdateChart() {
  const orderedItemsInfos = orderedItems
    .map((orderedItem) => {
      for (let menuItem of orderedMenuItems) {
        if (menuItem.id === orderedItem.menuItemId) {
          if (Date.parse(orderedItem.createdAt) < lastFetchTime) continue;
          return {
            quantity: orderedItem.quantity,
            type: menuItem.type ? menuItem.type : "(Sem tipo)",
          };
        }
      }
    })
    .filter((elem) => elem !== undefined);

  const formatedOrderedItems = {};
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

function updateChart(items, menuItems) {
  orderedItems = items;
  orderedMenuItems = menuItems;

  const addedOrders = getInfosToUpdateChart();
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
      salesChart.data.labels.push(order);

      salesChart.data.datasets[0].data.push(addedOrders.order);
    }

    salesChart.update();
  }
}

export { makeChart, updateChart };

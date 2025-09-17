const chartPorcentage = document.querySelector("#chartPorcentage");
const chartQuantity = document.querySelector("#chartQuantity");
const ctx = document.getElementById("salesChart").getContext("2d");

let orderedItems = [];
let orderedMenuItems = [];
let salesChart;
let lastFetchTime;

function aggregateItemsByType(items) {
  return items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + Number(item.quantity);
    return acc;
  }, {});
}

function buildChartData() {
  const menuItemsMap = new Map(orderedMenuItems.map((item) => [item.id, item]));

  const itemsInfo = orderedItems
    .map((orderedItem) => {
      const menuItem = menuItemsMap.get(orderedItem.menuItemId);
      if (!menuItem) return null;

      return {
        quantity: orderedItem.quantity,
        type: menuItem.type || "(Sem tipo)",
      };
    })
    .filter(Boolean);

  return aggregateItemsByType(itemsInfo);
}

function buildChartDataForUpdates() {
  const itemsInfo = orderedItems
    .map((orderedItem) => {
      const menuItem = orderedItems.find(
        (m) => m.id === orderedItem.menuItemId,
      );
      if (!menuItem) return null;

      if (Date.parse(orderedItem.createdAt) < lastFetchTime) return null;

      return {
        quantity: orderedItem.quantity,
        type: menuItem.type ? menuItem.type : "(Sem tipo)",
      };
    })
    .filter(Boolean);

  return aggregateItemsByType(itemsInfo);
}

function updateHoverTexts(chart, index) {
  const value = chart.data.datasets[0].data[index];
  const total = chart.data.datasets[0].data.reduce((a, b) => +a + +b);
  const percentage = ((value / total) * 100).toFixed(1);

  chartPorcentage.innerText = `${percentage}%`;
  chartQuantity.innerText = `(${value})`;
}

function makeChart(items, menuItems, lastFetch) {
  orderedItems = items;
  orderedMenuItems = menuItems;
  lastFetchTime = lastFetch;

  document.querySelector(".chart-skeleton")?.remove();

  if (salesChart) {
    salesChart.destroy();
    document.querySelector("canvas").onmouseleave = "";
  }

  if (orderedItems.length === 0) {
    chartPorcentage.textContent = "Nada foi vendido durante esse período";
    chartQuantity.textContent = "";
    return;
  }

  const formatedOrderedItems = buildChartData();

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
        padding: 10,
      },
      plugins: {
        legend: {
          position: false,
        },
      },
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          updateHoverTexts(salesChart, chartElement[0].index);
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

function updateChart(items, menuItems) {
  orderedItems = items;
  orderedMenuItems = menuItems;

  const newOrders = buildChartDataForUpdates();
  lastFetchTime = Date.now();

  for (let type in newOrders) {
    if (salesChart.data.labels.includes(type)) {
      const indexOfOrder = salesChart.data.labels.indexOf(type);

      const currentValue = Number(
        salesChart.data.datasets[0].data[indexOfOrder],
      );
      const addedValue = Number(newOrders[type]);

      salesChart.data.datasets[0].data[indexOfOrder] =
        currentValue + addedValue;
    } else {
      salesChart.data.labels.push(type);
      salesChart.data.datasets[0].data.push(newOrders.order);
    }

    salesChart.update();
  }
}

export { makeChart, updateChart };

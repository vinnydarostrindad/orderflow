const menuBtn = document.querySelector("#menuBtn");
const leftBtn = document.querySelector("#leftBtn");
const rightBtn = document.querySelector("#rightBtn");

menuBtn.addEventListener("click", toggleMenuBar);
leftBtn.addEventListener("click", moveLastOrders);
rightBtn.addEventListener("click", moveLastOrders);

function moveLastOrders(e) {
  const btn = e.target.closest("button");
  const ordersBox = document.querySelector(".orders");
  const allOrders = document.querySelectorAll(".order");

  const ordersShown = Math.floor(
    ordersBox.parentElement.clientWidth / allOrders[0].offsetWidth,
  );

  let translateValue = getComputedStyle(ordersBox).translate;
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

const ctx = document.getElementById("salesChart").getContext("2d");
// eslint-disable-next-line no-undef
const salesChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Bebidas", "Prato Feito", "Sobremesas", "Peixes"],
    datasets: [
      {
        data: [30, 50, 10, 10],
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0"],
        hoverOffset: 20, // aumenta espaço na fatia ao hover
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
          (value / salesChart.data.datasets[0].data.reduce((a, b) => a + b)) *
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

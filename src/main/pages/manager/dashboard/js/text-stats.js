const ordersAmount = document.querySelector("#ordersAmount");
const completedOrder = document.querySelector("#completedOrders");
const canceledOrder = document.querySelector("#canceledOrders");
// const revenue = document.querySelector("#revenue");
// const hourlyRevenue = document.querySelector("#hourlyRevenue");

let orderedItems;

// async function showRevenue() {
// Quando fizer a API dos pagamentos, finalizar essa função
// const revenue = await fetch("${API_URL}/api/v1/payments")
// Fazer os calculos necessários
// revenue.textContent = revenueCalculated
//
// showHourlyRevenue(revenueCalclated)
// }

// function showHourlyRevenue(revenue) {
// Quando fizer a API dos pagamentos, finalizar essa função
// hourlyRevenue.textContent = revenue / 24; Talvez;
// }

function showAmountOfOrders() {
  const amountOfOrders = orderedItems.reduce((acc, item) => {
    return acc + +item.quantity;
  }, 0);

  ordersAmount.textContent = amountOfOrders;
}

function showAmountOfOrdersCompleted() {
  const ordersCompleted = orderedItems.reduce((acc, item) => {
    if (item.status === "delivered") return acc++;
    return acc;
  }, 0);

  completedOrder.textContent = ordersCompleted;
}

function showAmountOfOrdersCanceled() {
  const ordersCanceled = orderedItems.reduce((acc, item) => {
    if (item.status === "canceled") return acc++;
    return acc;
  }, 0);

  canceledOrder.textContent = ordersCanceled;
}

function textStats(items) {
  orderedItems = items;

  showAmountOfOrders();
  showAmountOfOrdersCompleted();
  showAmountOfOrdersCanceled();
}

export default textStats;

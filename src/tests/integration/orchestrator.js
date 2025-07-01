import postgresAdaptor from "../../infra/adaptors/postgres-adapter.js";

async function cleanDatabase() {
  await postgresAdaptor.query(
    "DROP SCHEMA public CASCADE; CREATE SCHEMA public;",
  );
}

async function runMigrations() {
  await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
}

async function createBusiness(props = {}) {
  const response = await fetch("http://localhost:3000/api/v1/business", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: props.name || "any_name",
      email: props.email || "any_email@mail.com",
      password: props.password || "any_password",
    }),
  });

  return await response.json().then((obj) => obj.business);
}

async function createEmployee(businessId, quantity = 1, props = {}) {
  let employees = [];
  for (let i = 0; i < quantity; i++) {
    const response = await fetch(
      `http://localhost:3000/api/v1/business/${businessId}/employee`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: props.name || "any_name",
          role: props.role || "waiter",
          password: props.password || "any_password",
        }),
      },
    );

    employees.push(await response.json().then((obj) => obj.employee));
  }
  return quantity === 1 ? employees[0] : employees;
}

async function createMenu(businessId, quantity = 1, props = {}) {
  let menus = [];
  for (let i = 0; i < quantity; i++) {
    const response = await fetch(
      `http://localhost:3000/api/v1/business/${businessId}/menu`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: props.name || `any_name_${i + 1}`,
        }),
      },
    );

    menus.push(await response.json());
  }

  return quantity === 1 ? menus[0] : menus;
}

async function createMenuItem(businessId, menuId, quantity = 1, props = {}) {
  let menuItems = [];
  for (let i = 0; i < quantity; i++) {
    const response = await fetch(
      `http://localhost:3000/api/v1/business/${businessId}/menu/${menuId}/item`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: props.name || `any_name_${i + 1}`,
          price: props.price || 9.9,
          imageFile: props.imagFile || null,
          description: props.description || "any_description",
          type: props.type || "any_type",
        }),
      },
    );

    menuItems.push(await response.json());
  }

  return quantity === 1 ? menuItems[0] : menuItems;
}

async function createTable(businessId, quantity = 1, props = {}) {
  let tables = [];
  for (let i = 0; i < quantity; i++) {
    const response = await fetch(
      `http://localhost:3000/api/v1/business/${businessId}/table`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          number: props.number || i + 1,
          name: props.name || "any_name",
        }),
      },
    );

    tables.push(await response.json());
  }

  return quantity === 1 ? tables[0] : tables;
}

async function createOrder(businessId, tableId, quantity = 1, props = {}) {
  let orders = [];
  for (let i = 0; i < quantity; i++) {
    const response = await fetch(
      `http://localhost:3000/api/v1/business/${businessId}/table/${tableId}/order`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tableNumber: props.tableNumber || i + 1,
        }),
      },
    );

    orders.push(await response.json());
  }

  return quantity === 1 ? orders[0] : orders;
}

async function createOrderItem(
  businessId,
  tableId,
  orderId,
  menuItemId,
  quantity = 1,
  props = {},
) {
  let orderItems = [];
  for (let i = 0; i < quantity; i++) {
    const response = await fetch(
      `http://localhost:3000/api/v1/business/${businessId}/table/${tableId}/order/${orderId}/item`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: menuItemId,
          quantity: props.quantity || 2,
          unitPrice: props.unitPrice || 20,
          totalPrice: props.totalPrice || 40,
          notes: props.notes || "any_notes",
        }),
      },
    );

    orderItems.push(await response.json());
  }

  return quantity === 1 ? orderItems[0] : orderItems;
}

export {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createEmployee,
  createMenu,
  createMenuItem,
  createTable,
  createOrder,
  createOrderItem,
};

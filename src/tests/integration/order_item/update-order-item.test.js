import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  createMenu,
  createMenuItem,
  createOrderItem,
  generateAuthCookie,
  createEmployee,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeOrderItemTestContext(numberOfOrderItems = 1) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const menu = await createMenu(business.id);
  const menuItem = await createMenuItem(business.id, menu.id);
  const table = await createTable(business.id);
  const orderItem = await createOrderItem(
    business.id,
    table.id,
    menuItem.id,
    numberOfOrderItems,
  );

  return { business, menuItem, orderItem, table, token };
}

describe("PATCH /api/v1/table/[tableId]/item", () => {
  test("Should update order item status, quantity and notes and return 200", async () => {
    const { table, token, orderItem, menuItem } =
      await makeOrderItemTestContext();

    const requestBody = {
      quantity: 4,
      status: "in_progress",
      notes: "updated_notes",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item/${orderItem.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: responseBody.id,
      tableId: table.id,
      menuItemId: menuItem.id,
      quantity: "4",
      unitPrice: "20.00",
      totalPrice: "80.00",
      status: "in_progress",
      notes: "updated_notes",
    });
  });

  test("Should update order item status, quantity and notes and return 200", async () => {
    const { table, token, menuItem, orderItem } =
      await makeOrderItemTestContext();

    const requestBody = {
      status: "in_progress",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item/${orderItem.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: responseBody.id,
      tableId: table.id,
      menuItemId: menuItem.id,
      quantity: "2",
      unitPrice: "20.00",
      totalPrice: "40.00",
      status: "in_progress",
      notes: "any_notes",
    });
  });
});

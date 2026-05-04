import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  createTableSession,
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
  const menu = await createMenu(business.id, 1, {}, token);
  const menuItem = await createMenuItem(business.id, menu.id, 1, {}, token);
  const table = await createTable(business.id, 1, {}, token);
  const tableSession = await createTableSession(
    business.id,
    table.id,
    {},
    token,
  );
  const orderItem = await createOrderItem(
    business.id,
    tableSession.id,
    menuItem.id,
    numberOfOrderItems,
    {},
    token,
  );

  return { business, menuItem, orderItem, table, tableSession, token };
}

describe("POST /api/v1/table-sessions/[tableSessionId]/items", () => {
  test("Should register a order item and return 201", async () => {
    const { tableSession, menuItem, token } = await makeOrderItemTestContext(0);

    const requestBody = {
      menuItemId: menuItem.id,
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    const orderItem = responseBody;

    expect(orderItem).toMatchObject({
      id: orderItem.id,
      tableSessionId: tableSession.id,
      menuItemId: requestBody.menuItemId,
      quantity: "2",
      unitPrice: "20.00",
      totalPrice: "40.00",
      notes: requestBody.notes,
    });

    expect(typeof orderItem.id).toBe("string");
    expect(uuidVersion(orderItem.id)).toBe(4);

    expect(typeof orderItem.menuItemId).toBe("string");
    expect(uuidVersion(orderItem.menuItemId)).toBe(4);

    expect(typeof orderItem.createdAt).toBe("string");
    expect(Date.parse(orderItem.createdAt)).not.toBeNaN();

    expect(typeof orderItem.updatedAt).toBe("string");
    expect(Date.parse(orderItem.updatedAt)).not.toBeNaN();
  });
});

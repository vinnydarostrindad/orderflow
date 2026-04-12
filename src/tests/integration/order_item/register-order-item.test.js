import { version as uuidVersion } from "uuid";
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

describe("POST /api/v1/business/[businessId]/table/[tableId]/item", () => {
  test("Should register a order item and return 201", async () => {
    const { table, menuItem, token } = await makeOrderItemTestContext(0);

    const requestBody = {
      menuItemId: menuItem.id,
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item`,
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
      tableId: table.id,
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

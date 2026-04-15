import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  createMenu,
  createMenuItem,
  createOrderItem,
  createEmployee,
  generateAuthCookie,
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

describe("GET /api/v1/ordered-items", () => {
  test("Should return correctly with", async () => {
    const { token, menuItem } = await makeOrderItemTestContext(2);

    const response = await fetch(`http://localhost:3000/api/v1/ordered-items`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((orderItem) => {
      expect(orderItem).toMatchObject({
        id: orderItem.id,
        menuItemId: menuItem.id,
        quantity: "2",
        totalPrice: "40.00",
        status: "pending",
      });

      expect(typeof orderItem.id).toBe("string");
      expect(uuidVersion(orderItem.id)).toBe(4);

      expect(typeof orderItem.menuItemId).toBe("string");
      expect(uuidVersion(orderItem.menuItemId)).toBe(4);
    });
  });

  test("Should return an empty array", async () => {
    const { token, table } = await makeOrderItemTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/table/[tableId]/item", () => {
  test("Should return all menu items with correct data", async () => {
    const { token, menuItem, table } = await makeOrderItemTestContext(2);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((orderItem) => {
      expect(orderItem).toMatchObject({
        id: orderItem.id,
        menuItemId: menuItem.id,
        quantity: "2",
        unitPrice: "20.00",
        totalPrice: "40.00",
        status: "pending",
        notes: "any_notes",
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

  test("Should return an empty array", async () => {
    const { token, table } = await makeOrderItemTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/table/[tableId]/item/[orderItemId]", () => {
  test("Should return correct menu item", async () => {
    const { orderItem, table, menuItem, token } =
      await makeOrderItemTestContext(1);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item/${orderItem.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      id: orderItem.id,
      menuItemId: menuItem.id,
      quantity: "2",
      unitPrice: "20.00",
      totalPrice: "40.00",
      status: "pending",
      notes: "any_notes",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.menuItemId).toBe("string");
    expect(uuidVersion(responseBody.menuItemId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });

  test("Should return NotFoundError if order item does not exists", async () => {
    const { table, token } = await makeOrderItemTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/item/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      statusCode: 404,
      action: "Make sure order item exists.",
      message: "OrderItem was not found.",
    });
  });
});

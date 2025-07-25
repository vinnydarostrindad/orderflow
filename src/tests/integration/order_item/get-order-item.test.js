import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  createOrder,
  createMenu,
  createMenuItem,
  createOrderItem,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[businessId]/ordered-items", () => {
  test("Should return all menu items with correct data", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    const menuItem = await createMenuItem(business.id, menu.id);
    const table = await createTable(business.id);
    const order = await createOrder(business.id, table.id);
    await createOrderItem(business.id, table.id, order.id, menuItem.id, 2);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/ordered-items`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((orderItem) => {
      expect(orderItem).toMatchObject({
        menuItemId: menuItem.id,
        quantity: "2",
        totalPrice: "40.00",
        status: "pending",
        tableNumber: "1",
      });

      expect(typeof orderItem.menuItemId).toBe("string");
      expect(uuidVersion(orderItem.menuItemId)).toBe(4);

      expect(typeof orderItem.createdAt).toBe("string");
      expect(Date.parse(orderItem.createdAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    await createMenuItem(business.id, menu.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/ordered-items`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/business/[businessId]/table/[tableId]/order/[orderId]/item", () => {
  test("Should return all menu items with correct data", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    const menuItem = await createMenuItem(business.id, menu.id);
    const table = await createTable(business.id);
    const order = await createOrder(business.id, table.id);
    await createOrderItem(business.id, table.id, order.id, menuItem.id, 2);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order/${order.id}/item`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((orderItem) => {
      expect(orderItem).toMatchObject({
        id: orderItem.id,
        orderId: order.id,
        menuItemId: menuItem.id,
        quantity: "2",
        unitPrice: "20.00",
        totalPrice: "40.00",
        status: "pending",
        notes: "any_notes",
      });

      expect(typeof orderItem.id).toBe("string");
      expect(uuidVersion(orderItem.id)).toBe(4);

      expect(typeof orderItem.orderId).toBe("string");
      expect(uuidVersion(orderItem.orderId)).toBe(4);

      expect(typeof orderItem.menuItemId).toBe("string");
      expect(uuidVersion(orderItem.menuItemId)).toBe(4);

      expect(typeof orderItem.createdAt).toBe("string");
      expect(Date.parse(orderItem.createdAt)).not.toBeNaN();

      expect(typeof orderItem.updatedAt).toBe("string");
      expect(Date.parse(orderItem.updatedAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    await createMenuItem(business.id, menu.id);
    const table = await createTable(business.id);
    const order = await createOrder(business.id, table.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order/${order.id}/item`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/business/[businessId]/table/[tableId]/order/[orderId]/item/[orderItemId]", () => {
  test("Should return correct menu item", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    const menuItem = await createMenuItem(business.id, menu.id);
    const table = await createTable(business.id);
    const order = await createOrder(business.id, table.id);
    const orderItem = await createOrderItem(
      business.id,
      table.id,
      order.id,
      menuItem.id,
    );

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order/${order.id}/item/${orderItem.id}`,
    );
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      id: orderItem.id,
      orderId: order.id,
      menuItemId: menuItem.id,
      quantity: "2",
      unitPrice: "20.00",
      totalPrice: "40.00",
      status: "pending",
      notes: "any_notes",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.orderId).toBe("string");
    expect(uuidVersion(responseBody.orderId)).toBe(4);

    expect(typeof responseBody.menuItemId).toBe("string");
    expect(uuidVersion(responseBody.menuItemId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });

  test("Should return NotFoundError if order item does not exists", async () => {
    const business = await createBusiness();
    const table = await createTable(business.id);
    const order = await createOrder(business.id, table.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order/${order.id}/item/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
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

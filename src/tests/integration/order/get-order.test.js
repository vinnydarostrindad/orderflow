import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  createOrder,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[businessId]/table/[tableId]/table", () => {
  test("Should return all tables with correct data", async () => {
    const business = await createBusiness();
    const table = await createTable(business.id);
    await createOrder(business.id, table.id, 2);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((order) => {
      expect(order).toMatchObject({
        id: order.id,
        businessId: business.id,
        tableId: table.id,
        tableNumber: "1",
        status: "pending",
      });

      expect(typeof order.id).toBe("string");
      expect(uuidVersion(order.id)).toBe(4);

      expect(typeof order.businessId).toBe("string");
      expect(uuidVersion(order.businessId)).toBe(4);

      expect(typeof order.tableId).toBe("string");
      expect(uuidVersion(order.tableId)).toBe(4);

      expect(typeof order.createdAt).toBe("string");
      expect(Date.parse(order.createdAt)).not.toBeNaN();

      expect(typeof order.updatedAt).toBe("string");
      expect(Date.parse(order.updatedAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const business = await createBusiness();
    const table = await createTable(business.id);
    await createOrder(business.id, table.id, 0);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/business/[businessId]/table/[tableId]/order/[orderId]", () => {
  test("Should return correct table", async () => {
    const business = await createBusiness();
    const table = await createTable(business.id);
    const order = await createOrder(business.id, table.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order/${order.id}`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: order.id,
      businessId: business.id,
      tableId: table.id,
      tableNumber: "1",
      status: "pending",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.businessId).toBe("string");
    expect(uuidVersion(responseBody.businessId)).toBe(4);

    expect(typeof responseBody.tableId).toBe("string");
    expect(uuidVersion(responseBody.tableId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });
});

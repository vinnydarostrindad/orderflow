import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  createOrder,
  createEmployee,
  generateAuthCookie,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeOrderTestContext(numberOfOrders = 1) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const table = await createTable(business.id);
  const order = await createOrder(business.id, table.id, numberOfOrders);

  return { business, order, token, table };
}

describe("GET /api/v1/table/[tableId]/order", () => {
  test("Should return all orders with correct data", async () => {
    const { business, table, token } = await makeOrderTestContext(2);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/order`,
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

    let i = 1;
    responseBody.forEach((order) => {
      expect(order).toMatchObject({
        id: order.id,
        businessId: business.id,
        tableId: table.id,
        tableNumber: `${i}`,
        status: "pending",
      });
      i++;

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
    const { table, token } = await makeOrderTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/order`,
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

describe("GET /api/v1/table/[tableId]/order/[orderId]", () => {
  test("Should return correct order", async () => {
    const { business, table, order, token } = await makeOrderTestContext();

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/order/${order.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
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

  test("Should return NotFoundError if order does not exists", async () => {
    const { table, token } = await makeOrderTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/order/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
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
      action: "Make sure order exists.",
      message: "Order was not found.",
    });
  });
});

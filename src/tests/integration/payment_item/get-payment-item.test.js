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
  createEmployee,
  createPayment,
  createPaymentItem,
  generateAuthCookie,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makePaymentItemTestContext(numberOfPaymentItems = 1) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id, 1, {
    role: "cashier",
  });
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
    [table.id],
    {},
    token,
  );
  const orderItem = await createOrderItem(
    business.id,
    tableSession.id,
    menuItem.id,
    1,
    {},
    token,
  );
  const payment = await createPayment(
    business.id,
    tableSession.id,
    1,
    {},
    token,
  );
  const paymentItem = await createPaymentItem(
    business.id,
    tableSession.id,
    payment.id,
    orderItem.id,
    numberOfPaymentItems,
    {},
    token,
  );

  return {
    business,
    menuItem,
    orderItem,
    table,
    tableSession,
    token,
    payment,
    paymentItem,
  };
}

describe("GET /api/v1/table-sessions/[tableSessionId]/payments/[paymentId]/items", () => {
  test("Should return all payment items correctly", async () => {
    const { token, tableSession, orderItem, payment } =
      await makePaymentItemTestContext(2);

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items`,
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

    responseBody.forEach((paymentItem) => {
      expect(paymentItem).toMatchObject({
        id: paymentItem.id,
        paymentId: payment.id,
        orderItemId: orderItem.id,
        quantity: "1",
        amount: "10.00",
        createdAt: paymentItem.createdAt,
      });

      expect(typeof paymentItem.id).toBe("string");
      expect(uuidVersion(paymentItem.id)).toBe(4);

      expect(typeof paymentItem.paymentId).toBe("string");
      expect(uuidVersion(paymentItem.paymentId)).toBe(4);

      expect(typeof paymentItem.orderItemId).toBe("string");
      expect(uuidVersion(paymentItem.orderItemId)).toBe(4);

      expect(typeof paymentItem.createdAt).toBe("string");
      expect(Date.parse(paymentItem.createdAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const { token, payment, tableSession } =
      await makePaymentItemTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items`,
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

describe("GET /api/v1/table-sessions/[tableSessionId]/payments/[paymentId]/items/[paymentItemId]", () => {
  test("Should return correct payment data", async () => {
    const { token, payment, paymentItem, tableSession, orderItem } =
      await makePaymentItemTestContext(1);

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items/${paymentItem.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: paymentItem.id,
      paymentId: payment.id,
      orderItemId: orderItem.id,
      quantity: "1",
      amount: "10.00",
      createdAt: paymentItem.createdAt,
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.paymentId).toBe("string");
    expect(uuidVersion(responseBody.paymentId)).toBe(4);

    expect(typeof responseBody.orderItemId).toBe("string");
    expect(uuidVersion(responseBody.orderItemId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
  });
});

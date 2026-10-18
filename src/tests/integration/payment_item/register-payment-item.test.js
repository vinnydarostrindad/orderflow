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
  createPayment,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makePaymentItemTestContext() {
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

  return { business, menuItem, orderItem, table, tableSession, token, payment };
}

describe("POST /api/v1/table-sessions/[tableSessionId]/payments/[paymentId]/item", () => {
  test("Should register a payment and return 201", async () => {
    const { tableSession, orderItem, payment, token } =
      await makePaymentItemTestContext();

    const requestBody = {
      orderItemId: orderItem.id,
      quantity: 1,
      amount: 10,
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items`,
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

    const paymentItem = responseBody;

    expect(paymentItem).toMatchObject({
      id: paymentItem.id,
      paymentId: payment.id,
      orderItemId: orderItem.id,
      quantity: "1",
      amount: "10.00",
    });

    expect(typeof paymentItem.id).toBe("string");
    expect(uuidVersion(paymentItem.id)).toBe(4);

    expect(typeof payment.id).toBe("string");
    expect(uuidVersion(payment.id)).toBe(4);

    expect(typeof payment.createdAt).toBe("string");
    expect(Date.parse(payment.createdAt)).not.toBeNaN();

    expect(typeof payment.updatedAt).toBe("string");
    expect(Date.parse(payment.updatedAt)).not.toBeNaN();
  });

  test("Should not create a payment item if item was already paid and return 400", async () => {
    const { tableSession, orderItem, payment, token } =
      await makePaymentItemTestContext();

    const requestBody = {
      orderItemId: orderItem.id,
      quantity: 1,
      amount: 10,
    };

    await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      name: "ValidationError",
      message: "Order item has already been paid",
      statusCode: 400,
      action: "No need to pay again",
    });
  });
});

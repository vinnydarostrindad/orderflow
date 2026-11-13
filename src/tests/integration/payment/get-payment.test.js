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
  generateAuthCookie,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makePaymentTestContext(numberOfPayments = 1) {
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
    numberOfPayments,
    {},
    token,
  );

  return { business, menuItem, orderItem, table, tableSession, token, payment };
}

describe("GET /api/v1/table-sessions/[tableSessionId]/payments", () => {
  test("Should return correctly with existing payments", async () => {
    const { token, tableSession } = await makePaymentTestContext(2);

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments`,
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

    responseBody.forEach((payment) => {
      expect(payment).toMatchObject({
        id: payment.id,
        tableSessionId: tableSession.id,
        amount: "40.00",
        status: "completed",
        createdAt: payment.createdAt,
      });

      expect(typeof payment.id).toBe("string");
      expect(uuidVersion(payment.id)).toBe(4);

      expect(typeof payment.tableSessionId).toBe("string");
      expect(uuidVersion(payment.tableSessionId)).toBe(4);

      expect(typeof payment.createdAt).toBe("string");
      expect(Date.parse(payment.createdAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const { token, tableSession } = await makePaymentTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments`,
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

describe("GET /api/v1/table-sessions/[tableSessionId]/payments/[paymentId]", () => {
  test("Should return correct payment data", async () => {
    const { token, payment, tableSession } = await makePaymentTestContext(1);

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: payment.id,
      tableSessionId: tableSession.id,
      amount: "40.00",
      status: "completed",
      createdAt: payment.createdAt,
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.tableSessionId).toBe("string");
    expect(uuidVersion(responseBody.tableSessionId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
  });
});

describe("GET /api/v1/payments", () => {
  test("Should return correct payments of business", async () => {
    const { token } = await makePaymentTestContext(1);

    const response = await fetch(`http://localhost:3000/api/v1/payments`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    responseBody.forEach((payment) => {
      expect(payment).toMatchObject({
        id: payment.id,
        tableSessionId: payment.tableSessionId,
        amount: "40.00",
        status: "completed",
        createdAt: payment.createdAt,
      });

      expect(typeof payment.id).toBe("string");
      expect(uuidVersion(payment.id)).toBe(4);

      expect(typeof payment.tableSessionId).toBe("string");
      expect(uuidVersion(payment.tableSessionId)).toBe(4);

      expect(typeof payment.createdAt).toBe("string");
      expect(Date.parse(payment.createdAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const { token } = await makePaymentTestContext(0);

    const response = await fetch(`http://localhost:3000/api/v1/payments`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

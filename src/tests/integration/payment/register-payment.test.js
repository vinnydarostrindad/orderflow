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

async function makePaymentsTestContext() {
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

  return { business, menuItem, orderItem, table, tableSession, token };
}

describe("POST /api/v1/table-sessions/[tableSessionId]/payments", () => {
  test("Should register a payment and return 201", async () => {
    const { tableSession, token } = await makePaymentsTestContext();

    const requestBody = {
      tableSession: tableSession.id,
      method: "pix",
      amount: 40,
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments`,
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

    const payment = responseBody;

    expect(payment).toMatchObject({
      id: payment.id,
      tableSessionId: tableSession.id,
      method: "pix",
      amount: "40.00",
      status: "completed",
    });

    expect(typeof payment.id).toBe("string");
    expect(uuidVersion(payment.id)).toBe(4);

    expect(typeof payment.tableSessionId).toBe("string");
    expect(uuidVersion(payment.tableSessionId)).toBe(4);

    expect(typeof payment.createdAt).toBe("string");
    expect(Date.parse(payment.createdAt)).not.toBeNaN();

    expect(typeof payment.updatedAt).toBe("string");
    expect(Date.parse(payment.updatedAt)).not.toBeNaN();
  });
});

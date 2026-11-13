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
  generateAuthCookie,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makePaymentFlowTestContext() {
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
  const orderItems = await createOrderItem(
    business.id,
    tableSession.id,
    menuItem.id,
    2,
    {},
    token,
  );

  return { tableSession, orderItems, token };
}

describe("Payment flow", () => {
  test("Should register one payment with all included order items", async () => {
    const { tableSession, orderItems, token } =
      await makePaymentFlowTestContext();
    const totalAmount = orderItems.reduce(
      (sum, orderItem) => sum + Number(orderItem.totalPrice),
      0,
    );

    const paymentResponse = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify({ method: "pix", amount: totalAmount }),
      },
    );

    expect(paymentResponse.status).toBe(201);
    const payment = await paymentResponse.json();
    expect(payment).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        tableSessionId: tableSession.id,
        method: "pix",
      }),
    );

    const paymentItemResponses = await Promise.all(
      orderItems.map((orderItem) =>
        fetch(
          `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: `token=${token}`,
            },
            body: JSON.stringify({
              orderItemId: orderItem.id,
              quantity: orderItem.quantity,
              amount: orderItem.totalPrice,
            }),
          },
        ),
      ),
    );

    paymentItemResponses.forEach((response) => {
      expect(response.status).toBe(201);
    });

    const paymentItemsResponse = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/payments/${payment.id}/items`,
      { headers: { cookie: `token=${token}` } },
    );

    expect(paymentItemsResponse.status).toBe(200);
    const paymentItems = await paymentItemsResponse.json();

    expect(paymentItems).toHaveLength(orderItems.length);
    expect(paymentItems.map(({ paymentId }) => paymentId)).toEqual(
      expect.arrayContaining(orderItems.map(() => payment.id)),
    );
    expect(paymentItems.map(({ orderItemId }) => orderItemId)).toEqual(
      expect.arrayContaining(orderItems.map(({ id }) => id)),
    );
    expect(
      paymentItems.reduce((sum, paymentItem) => {
        return sum + Number(paymentItem.amount);
      }, 0),
    ).toBe(totalAmount);
  });
});

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

describe("POST /api/v1/business/[businessId]/table/[tableId]/order", () => {
  test("Should register a order and return 201", async () => {
    const { business, table, token } = await makeOrderTestContext(0);
    const requestBody = {
      tableNumber: 1,
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}/order`,
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
    const order = responseBody;

    expect(order).toMatchObject({
      id: order.id,
      business_id: business.id,
      table_id: table.id,
      table_number: requestBody.tableNumber,
      status: "pending",
    });

    expect(typeof order.id).toBe("string");
    expect(uuidVersion(order.id)).toBe(4);

    expect(typeof order.business_id).toBe("string");
    expect(uuidVersion(order.business_id)).toBe(4);

    expect(typeof order.table_id).toBe("string");
    expect(uuidVersion(order.table_id)).toBe(4);

    expect(typeof order.created_at).toBe("string");
    expect(Date.parse(order.created_at)).not.toBeNaN();

    expect(typeof order.updated_at).toBe("string");
    expect(Date.parse(order.updated_at)).not.toBeNaN();
  });
});

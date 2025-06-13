import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
} from "../orchestrator.js";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business/[businessId]/table/[tableId]/order", () => {
  test("should register a table and return 201", async () => {
    const business = await createBusiness();
    const table = await createTable(business.id);

    const requestBody = {
      tableNumber: 1,
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

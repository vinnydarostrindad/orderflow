import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  generateAuthCookie,
  createEmployee,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeTableTestContext(numberOfTables = 1) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const table = await createTable(business.id, numberOfTables);

  return { business, token, table };
}

describe("GET /api/v1/business/[businessId]/table", () => {
  test("Should return all tables with correct data", async () => {
    const { business, token } = await makeTableTestContext(2);
    const response = await fetch(`http://localhost:3000/api/v1/table`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    let i = 1;
    responseBody.forEach((table) => {
      expect(table).toMatchObject({
        id: table.id,
        businessId: business.id,
        number: `${i}`,
        name: "any_name",
      });
      i++;

      expect(typeof table.id).toBe("string");
      expect(uuidVersion(table.id)).toBe(4);

      expect(typeof table.businessId).toBe("string");
      expect(uuidVersion(table.businessId)).toBe(4);

      expect(typeof table.createdAt).toBe("string");
      expect(Date.parse(table.createdAt)).not.toBeNaN();

      expect(typeof table.updatedAt).toBe("string");
      expect(Date.parse(table.updatedAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const { token } = await makeTableTestContext(0);
    const response = await fetch(`http://localhost:3000/api/v1/table`, {
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

describe("GET /api/v1/business/[businessId]/table/[tableId]", () => {
  test("Should return correct table", async () => {
    const { business, table, token } = await makeTableTestContext();

    const response = await fetch(
      `http://localhost:3000/api/v1/table/${table.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: table.id,
      businessId: business.id,
      number: "1",
      name: `any_name`,
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.businessId).toBe("string");
    expect(uuidVersion(responseBody.businessId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });

  test("Should return NotFoundError if table does not exists", async () => {
    const { token } = await makeTableTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/table/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
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
      action: "Make sure the table exists.",
      message: "Table was not found.",
    });
  });
});

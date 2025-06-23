import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[businessId]/table", () => {
  test("Should return all tables with correct data", async () => {
    const business = await createBusiness();
    await createTable(business.id, 2);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((table) => {
      expect(table).toMatchObject({
        id: table.id,
        businessId: business.id,
        number: "1",
        name: "any_name",
      });

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
    const business = await createBusiness();
    await createTable(business.id, 0);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/business/[businessId]/table/[tableId]", () => {
  test("Should return correct table", async () => {
    const business = await createBusiness();
    const table = await createTable(business.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}`,
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
    const business = await createBusiness();

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
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

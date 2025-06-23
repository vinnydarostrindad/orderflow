import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createEmployee,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[businessId]/employee", () => {
  test("Should return all employees with correct data", async () => {
    const business = await createBusiness();
    await createEmployee(business.id, 2);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/employee`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((employee) => {
      expect(employee).toMatchObject({
        businessId: business.id,
        name: "any_name",
        role: "waiter",
      });

      expect(typeof employee.id).toBe("string");
      expect(uuidVersion(employee.id)).toBe(4);

      expect(typeof employee.businessId).toBe("string");
      expect(uuidVersion(employee.businessId)).toBe(4);

      expect(typeof employee.createdAt).toBe("string");
      expect(Date.parse(employee.createdAt)).not.toBeNaN();

      expect(employee.password).toBeUndefined();

      expect(typeof employee.updatedAt).toBe("string");
      expect(Date.parse(employee.updatedAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const business = await createBusiness();
    await createEmployee(business.id, 0);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/employee`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/business/[businessId]/employee/[employeeId]", () => {
  test("Should return correct employee", async () => {
    const business = await createBusiness();
    const employee = await createEmployee(business.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/employee/${employee.id}`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      businessId: business.id,
      name: "any_name",
      role: "waiter",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.businessId).toBe("string");
    expect(uuidVersion(responseBody.businessId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(responseBody.password).toBeUndefined();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });

  test("Should return NotFoundError if employee does not exists", async () => {
    const business = await createBusiness();

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/employee/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      statusCode: 404,
      action: "Make sure the employee exists",
      message: "Employee was not found.",
    });
  });
});

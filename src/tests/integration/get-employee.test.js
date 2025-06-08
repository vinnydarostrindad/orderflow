import { version as uuidVersion } from "uuid";
import validator from "validator";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createEmployee,
} from "./orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[business_id]/employee", () => {
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
        business_id: business.id,
        name: "any_name",
        role: "waiter",
      });

      expect(uuidVersion(employee.id)).toBe(4);
      expect(validator.isUUID(employee.id)).toBe(true);

      expect(typeof employee.created_at).toBe("string");
      expect(Date.parse(employee.created_at)).not.toBeNaN();

      expect(employee.password).toBeUndefined();

      expect(typeof employee.updated_at).toBe("string");
      expect(Date.parse(employee.updated_at)).not.toBeNaN();
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

describe("GET /api/v1/business/[business_id]/employee/[employee_id]", () => {
  test("Should return correct employee", async () => {
    const business = await createBusiness();
    const employee = await createEmployee(business.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/employee/${employee.id}`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      business_id: business.id,
      name: "any_name",
      role: "waiter",
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(validator.isUUID(responseBody.id)).toBe(true);

    expect(typeof responseBody.created_at).toBe("string");
    expect(Date.parse(responseBody.created_at)).not.toBeNaN();

    expect(responseBody.password).toBeUndefined();

    expect(typeof responseBody.updated_at).toBe("string");
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
  });
});

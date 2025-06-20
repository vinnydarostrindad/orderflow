import {
  cleanDatabase,
  createBusiness,
  createEmployee,
  runMigrations,
} from "../orchestrator.js";
import { version as uuidVersion } from "uuid";
import validator from "validator";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business/[businessId]/employee", () => {
  test("Should register a employee correctly via api", async () => {
    const business = await createBusiness();

    const requestBody = {
      role: "waiter",
      name: "any_name",
      password: "any_password",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/employee`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );

    const responseBody = await response.json();

    expect(response.status).toBe(201);

    const { employee, token } = responseBody;

    expect(employee).toMatchObject({
      id: employee.id,
      business_id: business.id,
      name: requestBody.name,
      role: requestBody.role,
    });

    expect(typeof employee.id).toBe("string");
    expect(uuidVersion(employee.id)).toBe(4);

    expect(typeof employee.business_id).toBe("string");
    expect(uuidVersion(employee.business_id)).toBe(4);

    expect(typeof employee.password).toBe("string");
    expect(employee.password).not.toBe(requestBody.password);

    expect(typeof employee.created_at).toBe("string");
    expect(Date.parse(employee.created_at)).not.toBeNull();

    expect(typeof employee.updated_at).toBe("string");
    expect(Date.parse(employee.updated_at)).not.toBeNull();

    expect(validator.isJWT(token)).toBe(true);
  });

  test("should return different hashes for same password but different employees", async () => {
    const business = await createBusiness();
    const employees = await createEmployee(business.id, 2);

    expect(employees[0].password).not.toBe(employees[1].password);
  });
});

import {
  cleanDatabase,
  createBusiness,
  runMigrations,
} from "../orchestrator.js";
import { version as uuidVersion } from "uuid";
import validator from "validator";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business/[businessId]/employee", () => {
  test("Should register a employee correctly via api", async () => {
    const business = await createBusiness();

    const requestBody = {
      role: "waiter",
      name: "valid_name",
      password: "valid_password",
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
      name: requestBody.name,
      role: requestBody.role,
    });

    expect(uuidVersion(employee.id)).toBe(4);

    expect(typeof employee.password).toBe("string");
    expect(employee.password).not.toBe(requestBody.password);

    expect(typeof employee.createdAt).toBe("string");
    expect(Date.parse(employee.createdAt)).not.toBeNull();

    expect(typeof employee.updatedAt).toBe("string");
    expect(Date.parse(employee.updatedAt)).not.toBeNull();

    expect(validator.isJWT(token)).toBe(true);
  });
});

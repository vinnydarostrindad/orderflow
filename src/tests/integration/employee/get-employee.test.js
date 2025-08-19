import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createEmployee,
  generateAuthCookie,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeEmployeeTestContext(numberOfEmployees = 1) {
  const business = await createBusiness();
  const employee = await createEmployee(business.id, numberOfEmployees);
  const { business_id, role, id } = employee[0] || employee;
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });

  return { business, employee, token };
}

describe("GET /api/v1/employee", () => {
  test("Should return all employees with correct data", async () => {
    const { business, token } = await makeEmployeeTestContext(2);

    const response = await fetch(`http://localhost:3000/api/v1/employee`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    for (let i = 0; i < responseBody.length; i++) {
      expect(responseBody[i]).toMatchObject({
        businessId: business.id,
        name: `any_name_${i + 1}`,
        role: "waiter",
      });

      expect(typeof responseBody[i].id).toBe("string");
      expect(uuidVersion(responseBody[i].id)).toBe(4);

      expect(typeof responseBody[i].businessId).toBe("string");
      expect(uuidVersion(responseBody[i].businessId)).toBe(4);

      expect(typeof responseBody[i].createdAt).toBe("string");
      expect(Date.parse(responseBody[i].createdAt)).not.toBeNaN();

      expect(responseBody[i].password).toBeUndefined();

      expect(typeof responseBody[i].updatedAt).toBe("string");
      expect(Date.parse(responseBody[i].updatedAt)).not.toBeNaN();
    }
  });
});

describe("GET /api/v1/employee/[employeeId]", () => {
  test("Should return correct employee", async () => {
    const { business, employee, token } = await makeEmployeeTestContext();

    const response = await fetch(
      `http://localhost:3000/api/v1/employee/${employee.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      businessId: business.id,
      name: "any_name_1",
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
    const { token } = await makeEmployeeTestContext();

    const response = await fetch(
      `http://localhost:3000/api/v1/employee/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
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
      action: "Make sure the employee exists",
      message: "Employee was not found.",
    });
  });
});

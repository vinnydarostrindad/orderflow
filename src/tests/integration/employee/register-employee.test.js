import {
  cleanDatabase,
  createBusiness,
  createEmployee,
  generateAuthCookie,
  runMigrations,
} from "../orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeEmployeeTestContext(numberOfEmployees = 1, props) {
  const business = await createBusiness();
  const employee = await createEmployee(business.id, numberOfEmployees, props);
  const { business_id, role, id } = employee[0] || employee;
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });

  return { business, employee, token };
}

describe("POST /api/v1/employee", () => {
  test("Should register a employee correctly via api", async () => {
    const { business, token } = await makeEmployeeTestContext(0);

    const requestBody = {
      role: "waiter",
      name: "any_name",
      password: "any_password",
      businessId: business.id,
    };

    const response = await fetch(`http://localhost:3000/api/v1/employee`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `token=${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(201);

    const employee = responseBody;

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
  });

  test("Should return ValidationError if name with same role already exists on business", async () => {
    const { business, token } = await makeEmployeeTestContext(1, {
      name: "any_name",
    });

    const requestBody = {
      role: "waiter",
      name: "any_name",
      password: "any_password",
      businessId: business.id,
    };

    const response = await fetch(`http://localhost:3000/api/v1/employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `token=${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "ValidationError",
      statusCode: 400,
      action: "Use another name to perform this operation.",
      message: "An employee with this name already exists.",
    });
  });
});

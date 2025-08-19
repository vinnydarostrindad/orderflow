import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  createEmployee,
  createTable,
  generateAuthCookie,
  runMigrations,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeTableTestContext(numberOfTables = 1, props) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const table = await createTable(business.id, numberOfTables, props);

  return { business, token, table };
}

describe("POST /api/v1/business/[businessId]/table", () => {
  test("Should register a table and return 201", async () => {
    const { business, token } = await makeTableTestContext(0);

    const requestBody = {
      number: 1,
      name: "any_name",
    };

    const response = await fetch(`http://localhost:3000/api/v1/table`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: `token=${token}` },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(201);

    const responseBody = await response.json();
    const menu = responseBody;

    expect(menu).toMatchObject({
      id: menu.id,
      business_id: business.id,
      number: requestBody.number,
      name: requestBody.name,
    });

    expect(typeof menu.id).toBe("string");
    expect(uuidVersion(menu.id)).toBe(4);

    expect(typeof menu.business_id).toBe("string");
    expect(uuidVersion(menu.business_id)).toBe(4);

    expect(typeof menu.created_at).toBe("string");
    expect(Date.parse(menu.created_at)).not.toBeNaN();

    expect(typeof menu.updated_at).toBe("string");
    expect(Date.parse(menu.updated_at)).not.toBeNaN();
  });

  test("Should return ValidationError if number already exists in business", async () => {
    const { token } = await makeTableTestContext(1, { nuber: 1 });

    const requestBody = {
      number: 1,
    };

    const response = await fetch(`http://localhost:3000/api/v1/table`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `token=${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.json();
    expect(response.status).toBe(400);

    expect(responseBody).toEqual({
      name: "ValidationError",
      message: "The number provided is already in use.",
      action: "Use another number to perform this operation.",
      statusCode: 400,
    });
  });
});

import { version as uuidVersion } from "uuid";
import validator from "validator";
import {
  cleanDatabase,
  runMigrations,
  generateAuthCookie,
  createBusiness,
  createEmployee,
} from "../orchestrator";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeBusinessTestContext() {
  const business = await createBusiness();
  const { business_id, id, role } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  return { business, token };
}

describe("GET /api/v1/business", () => {
  test("Should return business correctly", async () => {
    const { business, token } = await makeBusinessTestContext();
    const response = await fetch(`http://localhost:3000/api/v1/business`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: business.id,
      name: "any_name",
      email: "any_email@mail.com",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(validator.isEmail(responseBody.email)).toBe(true);

    expect(responseBody.password).toBeUndefined();

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });
});

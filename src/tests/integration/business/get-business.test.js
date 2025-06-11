import { version as uuidVersion } from "uuid";
import validator from "validator";
import { cleanDatabase, runMigrations, createBusiness } from "../orchestrator";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[businessId]", () => {
  test("Should return business correctly", async () => {
    const business = await createBusiness();

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}`,
    );

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

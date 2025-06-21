import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  createMenu,
  runMigrations,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business/[businessId]/menu", () => {
  test("should register a menu and return 201", async () => {
    const business = await createBusiness();

    const requestBody = {
      name: "any_name",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    const menu = responseBody;

    expect(menu).toMatchObject({
      id: menu.id,
      business_id: business.id,
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

  test("should return ValidationError if name already exists on business", async () => {
    const business = await createBusiness();
    await createMenu(business.id, 1, { name: "any_name" });

    const requestBody = {
      name: "any_name",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "ValidationError",
      statusCode: 400,
      action: "Make sure name does not exists.",
      message: "Name already exists in your business.",
    });
  });
});

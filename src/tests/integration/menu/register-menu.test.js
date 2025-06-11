import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  runMigrations,
} from "../orchestrator.js";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business/[businessId]/menu", () => {
  test("should register a menu and return 201", async () => {
    const business = await createBusiness();

    const requestBody = {
      name: "valid_name",
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
      businessId: business.id,
      name: requestBody.name,
    });

    expect(uuidVersion(menu.id)).toBe(4);

    expect(uuidVersion(menu.businessId)).toBe(4);

    expect(typeof menu.createdAt).toBe("string");
    expect(Date.parse(menu.createdAt)).not.toBeNaN();

    expect(typeof menu.updatedAt).toBe("string");
    expect(Date.parse(menu.updatedAt)).not.toBeNaN();
  });
});

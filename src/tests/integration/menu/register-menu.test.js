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

describe("menu registration api", () => {
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
      business_id: business.id,
      name: requestBody.name,
    });

    expect(uuidVersion(menu.id)).toBe(4);

    expect(uuidVersion(menu.business_id)).toBe(4);

    expect(typeof menu.created_at).toBe("string");
    expect(Date.parse(menu.created_at)).not.toBeNaN();

    expect(typeof menu.updated_at).toBe("string");
    expect(Date.parse(menu.updated_at)).not.toBeNaN();
  });
});

import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createMenu,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[businessId]/menu", () => {
  test("Should return all menus with correct data", async () => {
    const business = await createBusiness();
    await createMenu(business.id, 2);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    let n = 1;
    responseBody.forEach((menu) => {
      expect(menu).toMatchObject({
        id: menu.id,
        businessId: business.id,
        name: `any_name_${n}`,
      });
      n += 1;

      expect(typeof menu.id).toBe("string");
      expect(uuidVersion(menu.id)).toBe(4);

      expect(typeof menu.businessId).toBe("string");
      expect(uuidVersion(menu.businessId)).toBe(4);

      expect(typeof menu.createdAt).toBe("string");
      expect(Date.parse(menu.createdAt)).not.toBeNaN();

      expect(typeof menu.updatedAt).toBe("string");
      expect(Date.parse(menu.updatedAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const business = await createBusiness();
    await createMenu(business.id, 0);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/business/[businessId]/menu/[menuId]", () => {
  test("Should return correct menu", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu/${menu.id}`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: menu.id,
      businessId: business.id,
      name: "any_name_1",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.businessId).toBe("string");
    expect(uuidVersion(responseBody.businessId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });

  test("Should return NotFoundError if menu does not exists", async () => {
    const business = await createBusiness();

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      statusCode: 404,
      action: "Make sure menu exists.",
      message: "Menu was not found.",
    });
  });
});

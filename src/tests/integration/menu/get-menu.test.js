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

describe("GET /api/v1/business/[business_id]/menu", () => {
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
        business_id: business.id,
        name: `any_name_${n}`,
      });
      n += 1;

      expect(uuidVersion(menu.id)).toBe(4);

      expect(uuidVersion(menu.business_id)).toBe(4);

      expect(typeof menu.created_at).toBe("string");
      expect(Date.parse(menu.created_at)).not.toBeNaN();

      expect(typeof menu.updated_at).toBe("string");
      expect(Date.parse(menu.updated_at)).not.toBeNaN();
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

describe("GET /api/v1/business/[business_id]/menu/[menu_id]", () => {
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
      business_id: business.id,
      name: "any_name_1",
    });

    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(uuidVersion(responseBody.business_id)).toBe(4);

    expect(typeof responseBody.created_at).toBe("string");
    expect(Date.parse(responseBody.created_at)).not.toBeNaN();

    expect(typeof responseBody.updated_at).toBe("string");
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
  });
});

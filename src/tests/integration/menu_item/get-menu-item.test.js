import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createMenu,
  createMenuItem,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("GET /api/v1/business/[businessId]/menu/[menuId]/item", () => {
  test("Should return all menu items with correct data", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    await createMenuItem(business.id, menu.id, 2);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu/${menu.id}/item`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((menuItem) => {
      expect(menuItem).toMatchObject({
        id: menuItem.id,
        menuId: menu.id,
        name: "any_name",
        price: "9.90",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      });

      expect(typeof menuItem.id).toBe("string");
      expect(uuidVersion(menuItem.id)).toBe(4);

      expect(typeof menuItem.menuId).toBe("string");
      expect(uuidVersion(menuItem.menuId)).toBe(4);

      expect(typeof menuItem.createdAt).toBe("string");
      expect(Date.parse(menuItem.createdAt)).not.toBeNaN();

      expect(typeof menuItem.updatedAt).toBe("string");
      expect(Date.parse(menuItem.updatedAt)).not.toBeNaN();
    });
  });

  test("Should return an empty array", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    await createMenuItem(business.id, menu.id, 0);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu/${menu.id}/item`,
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/business/[businessId]/menu/[menuId]/item/[menuItemId]", () => {
  test("Should return correct menu item", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    const menuItem = await createMenuItem(business.id, menu.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu/${menu.id}/item/${menuItem.id}`,
    );
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      id: menuItem.id,
      menuId: menu.id,
      name: "any_name",
      price: "9.90",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.menuId).toBe("string");
    expect(uuidVersion(responseBody.menuId)).toBe(4);

    expect(typeof responseBody.createdAt).toBe("string");
    expect(Date.parse(responseBody.createdAt)).not.toBeNaN();

    expect(typeof responseBody.updatedAt).toBe("string");
    expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
  });
});

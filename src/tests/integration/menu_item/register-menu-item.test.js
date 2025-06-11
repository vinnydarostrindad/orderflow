import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  createMenu,
  runMigrations,
} from "../orchestrator.js";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business/[businessId]/menu/[menuId]/item", () => {
  test("should register a menu and return 201", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);

    const requestBody = {
      name: "any_name",
      price: "39.90",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/menu/${menu.id}/item`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    const menuItem = responseBody;

    expect(menuItem).toMatchObject({
      id: menuItem.id,
      menuId: menu.id,
      name: requestBody.name,
      price: requestBody.price,
      imagePath: requestBody.imagePath,
      description: requestBody.description,
      type: requestBody.type,
    });

    expect(uuidVersion(menuItem.id)).toBe(4);

    expect(uuidVersion(menuItem.menuId)).toBe(4);

    expect(typeof menuItem.createdAt).toBe("string");
    expect(Date.parse(menuItem.createdAt)).not.toBeNaN();

    expect(typeof menuItem.updatedAt).toBe("string");
    expect(Date.parse(menuItem.updatedAt)).not.toBeNaN();
  });
});

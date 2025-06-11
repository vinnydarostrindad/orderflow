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
      price: 9.9,
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
      menu_id: menu.id,
      name: requestBody.name,
      price: "9.90",
      image_path: requestBody.imagePath,
      description: requestBody.description,
      type: requestBody.type,
    });

    expect(typeof menuItem.id).toBe("string");
    expect(uuidVersion(menuItem.id)).toBe(4);

    expect(typeof menuItem.menu_id).toBe("string");
    expect(uuidVersion(menuItem.menu_id)).toBe(4);

    expect(typeof menuItem.created_at).toBe("string");
    expect(Date.parse(menuItem.created_at)).not.toBeNaN();

    expect(typeof menuItem.updated_at).toBe("string");
    expect(Date.parse(menuItem.updated_at)).not.toBeNaN();
  });
});

import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createMenu,
  createMenuItem,
  createEmployee,
  generateAuthCookie,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeMenuItemTestContext(numberOfMenuItems = 1) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const menu = await createMenu(business.id);
  const menuItem = await createMenuItem(
    business.id,
    menu.id,
    numberOfMenuItems,
  );

  return { business, menu, menuItem, token };
}

describe("GET /api/v1/menu-item/[menuItemId]", () => {
  test("Should return menu item with correct data", async () => {
    const { menu, menuItem, token } = await makeMenuItemTestContext();

    const response = await fetch(
      `http://localhost:3000/api/v1/menu-item/${menuItem.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: responseBody.id,
      menuId: menu.id,
      name: `any_name_1`,
      price: "9.90",
      imagePath: null,
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

  test("Should return NotFoundError if menu item does not exists", async () => {
    const { token } = await makeMenuItemTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/menu-item/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      statusCode: 404,
      action: "Make sure menu item exists.",
      message: "MenuItem was not found.",
    });
  });
});

describe("GET /api/v1/menu/[menuId]/item", () => {
  test("Should return all menu items with correct data", async () => {
    const { menu, token } = await makeMenuItemTestContext(2);

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/${menu.id}/item`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    let i = 1;
    responseBody.forEach((menuItem) => {
      expect(menuItem).toMatchObject({
        id: menuItem.id,
        menuId: menu.id,
        name: `any_name_${i}`,
        price: "9.90",
        imagePath: null,
        description: "any_description",
        type: "any_type",
      });
      i++;

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
    const { menu, token } = await makeMenuItemTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/${menu.id}/item`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/menu/[menuId]/item/[menuItemId]", () => {
  test("Should return correct menu item", async () => {
    const { menu, menuItem, token } = await makeMenuItemTestContext();

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/${menu.id}/item/${menuItem.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      id: menuItem.id,
      menuId: menu.id,
      name: "any_name_1",
      price: "9.90",
      imagePath: null,
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

  test("Should return NotFoundError if menu item does not exists", async () => {
    const { menu, token } = await makeMenuItemTestContext(1);

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/${menu.id}/item/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      statusCode: 404,
      action: "Make sure menu item exists.",
      message: "MenuItem was not found.",
    });
  });
});

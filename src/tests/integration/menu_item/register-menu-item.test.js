import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  createEmployee,
  createMenu,
  createMenuItem,
  generateAuthCookie,
  runMigrations,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeMenuItemTestContext(numberOfMenuItems = 1, props) {
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
    props,
  );

  return { business, menu, menuItem, token };
}

describe("POST /api/v1/business/[businessId]/menu/[menuId]/item", () => {
  test("Should register a menu and return 201", async () => {
    const { menu, token } = await makeMenuItemTestContext(0);

    const requestBody = {
      name: "any_name",
      price: 9.9,
      imageFile: null,
      description: "any_description",
      type: "any_type",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/${menu.id}/item`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
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
      image_path: null,
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

  test("Should return ValidationError if name already exists on menu", async () => {
    const { menu, token } = await makeMenuItemTestContext(1, {
      name: "any_name_1",
    });

    const requestBody = {
      name: "any_name_1",
      price: 9.9,
      imageFile: null,
      description: "any_description",
      type: "any_type",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/${menu.id}/item`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "ValidationError",
      statusCode: 400,
      action: "Make sure name does not exists.",
      message: "Name already exists in your menu.",
    });
  });
});

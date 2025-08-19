import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createMenu,
  createEmployee,
  generateAuthCookie,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeMenuTestContext(numberOfMenus = 1) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const menu = await createMenu(business.id, numberOfMenus);

  return { business, menu, token };
}

describe("GET /api/v1/menu", () => {
  test("Should return all menus with correct data", async () => {
    const { business, token } = await makeMenuTestContext(2);

    const response = await fetch(`http://localhost:3000/api/v1/menu`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

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
    const { token } = await makeMenuTestContext(0);

    const response = await fetch(`http://localhost:3000/api/v1/menu`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});

describe("GET /api/v1/menu/[menuId]", () => {
  test("Should return correct menu", async () => {
    const { business, menu, token } = await makeMenuTestContext();

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/${menu.id}`,
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
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
    const { token } = await makeMenuTestContext(0);

    const response = await fetch(
      `http://localhost:3000/api/v1/menu/f3b8e3c2-9f6a-4b8c-ae37-1e9b2f9d8a1c`,
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
      action: "Make sure menu exists.",
      message: "Menu was not found.",
    });
  });
});

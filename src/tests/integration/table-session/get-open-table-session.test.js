import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  createEmployee,
  createTable,
  createTableSession,
  generateAuthCookie,
  runMigrations,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeGetOpenTableSessionTestContext(numberOfTables = 1, props) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const table = await createTable(business.id, numberOfTables, props, token);
  const tableSession = await createTableSession(
    business_id,
    table.id,
    {},
    token,
  );

  return {
    business,
    table,
    tableSession,
    token,
  };
}

describe("GET /api/v1/table-sessions/open?tableId=X", () => {
  test("Should return 200 and table session if exists", async () => {
    const { table, tableSession } = await makeGetOpenTableSessionTestContext(
      1,
      {},
    );

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${table.id}`,
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: tableSession.id,
      tableId: table.id,
      name: "any_name",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.tableId).toBe("string");
    expect(uuidVersion(responseBody.tableId)).toBe(4);

    expect(typeof responseBody.openedAt).toBe("string");
    expect(Date.parse(responseBody.openedAt)).not.toBeNaN();

    expect(responseBody.closedAt).toBe(null);
  });

  test("Should return NotFoundError if table session not exists", async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/de3d9b50-4635-400b-87a2-21e9bf9f6191`,
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      statusCode: 404,
      action: "Make sure the table session is open.",
      message: "TableSession was not found.",
    });
  });
});

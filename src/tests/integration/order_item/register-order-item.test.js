import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createTable,
  createOrder,
  createMenu,
  createMenuItem,
} from "../orchestrator.js";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business/[businessId]/table/[tableId]/order/[orderId]/item", () => {
  test("should register a order item and return 201", async () => {
    const business = await createBusiness();
    const menu = await createMenu(business.id);
    const menuItem = await createMenuItem(business.id, menu.id);
    const table = await createTable(business.id);
    const order = await createOrder(business.id, table.id);

    const requestBody = {
      menuItemId: menuItem.id,
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}/table/${table.id}/order/${order.id}/item`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    const orderItem = responseBody;

    expect(orderItem).toMatchObject({
      id: orderItem.id,
      order_id: order.id,
      menu_item_id: requestBody.menuItemId,
      quantity: 2,
      unit_price: "20.00",
      total_price: "40.00",
      notes: requestBody.notes,
    });

    expect(typeof orderItem.id).toBe("string");
    expect(uuidVersion(orderItem.id)).toBe(4);

    expect(typeof orderItem.order_id).toBe("string");
    expect(uuidVersion(orderItem.order_id)).toBe(4);

    expect(typeof orderItem.menu_item_id).toBe("string");
    expect(uuidVersion(orderItem.menu_item_id)).toBe(4);

    expect(typeof orderItem.created_at).toBe("string");
    expect(Date.parse(orderItem.created_at)).not.toBeNaN();

    expect(typeof orderItem.updated_at).toBe("string");
    expect(Date.parse(orderItem.updated_at)).not.toBeNaN();
  });
});

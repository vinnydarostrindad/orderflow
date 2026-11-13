import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class OrderItemRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({
    id,
    tableSessionId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes,
  } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!menuItemId) throw new MissingParamError("menuItemId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!unitPrice) throw new MissingParamError("unitPrice");
    if (!totalPrice) throw new MissingParamError("totalPrice");

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          order_items (id, table_session_id, menu_item_id, quantity, unit_price, total_price, notes)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          *
      ;`,
      values: [
        id,
        tableSessionId,
        menuItemId,
        quantity,
        unitPrice,
        totalPrice,
        notes,
      ],
    });

    return result.rows[0];
  }

  async findAll(tableSessionId) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT 
          *
        FROM
          order_items
        WHERE
          table_session_id = $1
        LIMIT
          10
      ;`,
      values: [tableSessionId],
    });

    return result.rows;
  }

  async findAllByBusinessId(businessId, period) {
    if (!businessId) throw new MissingParamError("businessId");

    let timeFilter;
    switch (period) {
      case "day":
        timeFilter = "AND oi.created_at >= date_trunc('day', CURRENT_DATE)";
        break;
      case "week":
        timeFilter = `
          AND oi.created_at >= date_trunc('week', CURRENT_DATE)
          AND oi.created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
        `;
        break;
      case "month":
        timeFilter = `
          AND oi.created_at >= date_trunc('month', CURRENT_DATE)
          AND oi.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        `;
        break;
      case "6month":
        timeFilter = `
          AND oi.created_at >= date_trunc('day', CURRENT_DATE) - INTERVAL '6 months'
        `;
        break;
      case "year":
        timeFilter = `
          AND oi.created_at >= date_trunc('year', CURRENT_DATE)
          AND oi.created_at < date_trunc('year', CURRENT_DATE) + INTERVAL '1 year'
        `;
        break;

      default:
        timeFilter = "";
        break;
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT 
          oi.id,
          oi.table_session_id,
          t.business_id,
          oi.menu_item_id,
          oi.quantity,
          oi.total_price,
          oi.notes,
          oi.status,
          oi.created_at AS order_item_created_at,
          oi.updated_at AS order_item_updated_at,
          t.number AS table_number
        FROM
          order_items oi
        JOIN
          table_sessions ts ON oi.table_session_id = ts.id
        JOIN
          tables t ON ts.table_id = t.id
        WHERE
          t.business_id = $1 ${timeFilter}
        ORDER BY
          order_item_created_at ASC
      ;`,
      values: [businessId],
    });

    return result.rows;
  }

  async findById(tableSessionId, orderItemId) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!orderItemId) throw new MissingParamError("orderItemId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          order_items
        WHERE
          id = $1 AND table_session_id = $2
        LIMIT
          1
        ;`,
      values: [orderItemId, tableSessionId],
    });

    return result.rows[0];
  }

  async update({ businessId, orderItemId, status, quantity, notes }) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!orderItemId) throw new MissingParamError("orderItemId");

    const result = await this.postgresAdapter.query({
      text: `
        UPDATE order_items oi
        SET
          quantity = COALESCE($4, oi.quantity),

          total_price = CASE
            WHEN $4 IS NOT NULL
              THEN $4 * oi.unit_price
            ELSE oi.total_price
          END,

          status = COALESCE($3, oi.status),
          notes = COALESCE($5, oi.notes),
          updated_at = timezone('utc', now())
        FROM
          table_sessions ts
        JOIN
          tables t ON ts.table_id = t.id
        WHERE
          oi.id = $1
          AND oi.table_session_id = ts.id
          AND t.business_id = $2
        RETURNING oi.*
        ;`,
      values: [orderItemId, businessId, status, quantity, notes],
    });

    return result.rows[0];
  }
}

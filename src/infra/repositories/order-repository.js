import MissingParamError from "../../utils/errors/missing-param-error.js";
import ValidationError from "../../utils/errors/validation-error.js";

export default class OrderRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, businessId, tableId, tableNumber } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!businessId) throw new MissingParamError("businessId");
    if (!tableId) throw new MissingParamError("tableId");
    if (!tableNumber) throw new MissingParamError("tableNumber");

    await this.validateUniqueTableNumber(businessId, tableNumber);

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          orders (id, business_id, table_id, table_number)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      ;`,
      values: [id, businessId, tableId, tableNumber],
    });

    return result.rows[0];
  }

  async findAll(tableId) {
    if (!tableId) throw new MissingParamError("tableId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          orders
        WHERE
          table_id = $1
        LIMIT
          10
      ;`,
      values: [tableId],
    });

    return result.rows;
  }

  async findById(tableId, orderId) {
    if (!tableId) throw new MissingParamError("tableId");
    if (!orderId) throw new MissingParamError("orderId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          orders
        WHERE
          id = $1 AND table_id = $2
        LIMIT
          1
        ;`,
      values: [orderId, tableId],
    });

    return result.rows[0];
  }

  async validateUniqueTableNumber(businessId, tableNumber) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!tableNumber) throw new MissingParamError("tableNumber");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          1
        FROM
          orders
        WHERE
         business_id = $1 AND table_number = $2
        LIMIT
          1
      `,
      values: [businessId, tableNumber],
    });

    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "The table number provided is already in use.",
        action: "Use another table number to perform this operation.",
      });
    }
  }
}

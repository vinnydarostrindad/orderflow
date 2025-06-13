import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class OrderRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, businessId, tableId, tableNumber } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!businessId) throw new MissingParamError("businessId");
    if (!tableId) throw new MissingParamError("tableId");
    if (!tableNumber) throw new MissingParamError("tableNumber");

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

    if (!result) {
      return null;
    }

    return result.rows[0];
  }
}

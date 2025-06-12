import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class TableRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, businessId, number, name } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!businessId) {
      throw new MissingParamError("businessId");
    }
    if (!number) {
      throw new MissingParamError("number");
    }

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          tables (id, business_id, number, name)
        VALUES 
          ($1, $2, $3, $4)
        RETURNING
          *
      `,
      values: [id, businessId, number, name],
    });

    if (!result) {
      return null;
    }

    return result.rows[0];
  }

  async findAll(businessId) {
    if (!businessId) {
      throw new MissingParamError("businessId");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          tables
        WHERE
          business_id = $1
        LIMIT
          10
      `,
      values: [businessId],
    });

    if (!result) {
      return null;
    }

    return result.rows;
  }

  async findById(businessId, tableId) {
    if (!businessId) {
      throw new MissingParamError("businessId");
    }
    if (!tableId) {
      throw new MissingParamError("tableId");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          tables
        WHERE
          id = $1 AND business_id = $2
        LIMIT
          1
      `,
      values: [tableId, businessId],
    });

    if (!result) {
      return null;
    }

    return result.rows[0];
  }
}

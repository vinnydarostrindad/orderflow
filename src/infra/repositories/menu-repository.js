import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class MenuRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, business_id, name } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!business_id) {
      throw new MissingParamError("business_id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          menus (id, business_id, name)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [id, business_id, name],
    });

    if (!result) {
      return null;
    }

    return result.rows[0];
  }
}

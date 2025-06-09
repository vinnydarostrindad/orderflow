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

  async findAll(business_id) {
    if (!business_id) {
      throw new MissingParamError("business_id");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT 
          *
        FROM
          menus
        WHERE
          business_id = $1
        LIMIT
          10
      ;`,
      values: [business_id],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows;
  }

  async findById(business_id, menu_id) {
    if (!business_id) {
      throw new MissingParamError("business_id");
    }
    if (!menu_id) {
      throw new MissingParamError("menu_id");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          menus
        WHERE
          id = $1 AND business_id = $2
        LIMIT
          1
        ;`,
      values: [menu_id, business_id],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows[0];
  }
}

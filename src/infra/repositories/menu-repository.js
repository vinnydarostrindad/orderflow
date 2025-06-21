import MissingParamError from "../../utils/errors/missing-param-error.js";
import ValidationError from "../../utils/errors/validation-error.js";

export default class MenuRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, businessId, name } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!businessId) throw new MissingParamError("businessId");
    if (!name) throw new MissingParamError("name");

    await this.verifyUniqueMenuName(businessId, name);

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          menus (id, business_id, name)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [id, businessId, name],
    });

    return result.rows[0];
  }

  async findAll(businessId) {
    if (!businessId) throw new MissingParamError("businessId");

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
      values: [businessId],
    });

    return result.rows;
  }

  async findById(businessId, menuId) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!menuId) throw new MissingParamError("menuId");

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
      values: [menuId, businessId],
    });

    return result.rows[0];
  }

  async verifyUniqueMenuName(businessId, name) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!name) throw new MissingParamError("name");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          1
        FROM
          menus
        WHERE
          business_id = $1 AND LOWER(name) = LOWER($2)
        LIMIT
          1
        ;`,
      values: [businessId, name],
    });

    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "Name already exists in your business.",
        action: "Make sure name does not exists.",
      });
    }
  }
}

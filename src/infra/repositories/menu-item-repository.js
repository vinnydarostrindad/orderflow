import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class MenuRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({
    id,
    menu_id,
    name,
    price,
    image_path,
    description,
    type,
  } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!menu_id) {
      throw new MissingParamError("menu_id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!price) {
      throw new MissingParamError("price");
    }

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          menu_items (id, menu_id, name, price, image_path, description, type)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          *
      ;`,
      values: [id, menu_id, name, price, image_path, description, type],
    });

    if (!result) {
      return null;
    }

    return result.rows[0];
  }
}

import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class MenuItemRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, menuId, name, price, imagePath, description, type } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!menuId) {
      throw new MissingParamError("menuId");
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
      values: [id, menuId, name, price, imagePath, description, type],
    });

    if (!result) {
      return null;
    }

    return result.rows[0];
  }

  async findAll(menuId) {
    if (!menuId) {
      throw new MissingParamError("menuId");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT 
          *
        FROM
          menu_items
        WHERE
          menu_id = $1
        LIMIT
          10
      ;`,
      values: [menuId],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows;
  }

  async findById(menuId, menuItemId) {
    if (!menuId) {
      throw new MissingParamError("menuId");
    }
    if (!menuItemId) {
      throw new MissingParamError("menuItemId");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          menu_items
        WHERE
          id = $1 AND menu_id = $2
        LIMIT
          1
        ;`,
      values: [menuItemId, menuId],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows[0];
  }
}

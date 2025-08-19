import MissingParamError from "../../utils/errors/missing-param-error.js";
import ValidationError from "../../utils/errors/validation-error.js";

export default class MenuItemRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, menuId, name, price, imagePath, description, type } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!menuId) throw new MissingParamError("menuId");
    if (!name) throw new MissingParamError("name");
    if (!price) throw new MissingParamError("price");

    await this.validateUniqueName(menuId, name);

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

    return result.rows[0];
  }

  async findAll(menuId) {
    if (!menuId) throw new MissingParamError("menuId");

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

    return result.rows;
  }

  async findById(menuItemId, menuId) {
    if (!menuItemId) throw new MissingParamError("menuItemId");

    if (!menuId) {
      const result = await this.postgresAdapter.query({
        text: `
          SELECT
            *
          FROM
            menu_items
          WHERE
            id = $1
          LIMIT
            1
          ;`,
        values: [menuItemId],
      });

      return result.rows[0];
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

    return result.rows[0];
  }

  async validateUniqueName(menuId, name) {
    if (!menuId) throw new MissingParamError("menuId");
    if (!name) throw new MissingParamError("name");

    const result = await this.postgresAdapter.query({
      text: `
          SELECT
            1
          FROM
            menu_items
          WHERE
            menu_id = $1 AND LOWER(name) = LOWER($2)
          LIMIT
            1
          ;`,
      values: [menuId, name],
    });

    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "Name already exists in your menu.",
        action: "Make sure name does not exists.",
      });
    }
  }
}

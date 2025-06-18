import MissingParamError from "../../utils/errors/missing-param-error.js";
import ValidationError from "../../utils/errors/validation-error.js";

export default class BusinessRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, name, email, hashedPassword } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!name) throw new MissingParamError("name");
    if (!email) throw new MissingParamError("email");
    if (!hashedPassword) throw new MissingParamError("hashedPassword");

    await this.validateUniqueName(name);

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          businesses (id, name, email, password)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      ;`,
      values: [id, name, email, hashedPassword],
    });
    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }
    return result.rows[0];
  }

  async findById(id) {
    if (!id) {
      throw new MissingParamError("id");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          businesses
        WHERE
          id = $1
        LIMIT
          1
      ;`,
      values: [id],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows[0];
  }

  async validateUniqueName(name) {
    if (!name) throw new MissingParamError("name");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          name
        FROM
          businesses
        WHERE
          LOWER(name) = LOWER($1)
        LIMIT
          1
      ;`,
      values: [name],
    });
    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "The name provided is already in use.",
        action: "Use another username to perform this operation.",
      });
    }
  }
}

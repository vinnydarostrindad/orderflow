import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class BusinessRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, name, email, hashedPassword } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!email) {
      throw new MissingParamError("email");
    }
    if (!hashedPassword) {
      throw new MissingParamError("hashedPassword");
    }

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
}

import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class TableSessionRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, tableId, name } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!tableId) throw new MissingParamError("tableId");

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          table_sessions (id, table_id, name)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [id, tableId, name],
    });

    return result.rows[0];
  }

  async findOpenByTableId(tableId) {
    if (!tableId) throw new MissingParamError("tableId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          table_sessions
        WHERE
          table_id = $1 AND status = 'open'
        ORDER BY
          opened_at DESC
        LIMIT
          1
      ;`,
      values: [tableId],
    });

    return result.rows[0];
  }

  async close(tableSessionId) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");

    const result = await this.postgresAdapter.query({
      text: `
        UPDATE
          table_sessions
        SET
          status = 'closed',
          closed_at = timezone('utc', now())
        WHERE
          id = $1 AND status = 'open'
        RETURNING
          *
      ;`,
      values: [tableSessionId],
    });

    return result.rows[0];
  }
}

import MissingParamError from "../../utils/errors/missing-param-error";

export default class TableSession {
  constructor({ id, tableId, name } = {}) {
    this.validate(id, tableId);

    this.id = id;
    this.tableId = tableId;
    this.name = name;
  }

  validate(id, tableId) {
    if (!id) throw new MissingParamError("tableSessionId");
    if (!tableId) throw new MissingParamError("tableId");
  }
}

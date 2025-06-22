import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class MenuItem {
  constructor({ id, businessId, tableId, tableNumber } = {}) {
    this.validate(id, businessId, tableId, tableNumber);

    this.id = id;
    this.businessId = businessId;
    this.tableId = tableId;
    this.tableNumber = tableNumber;
  }

  validate(id, businessId, tableId, tableNumber) {
    if (!id) throw new MissingParamError("id");
    if (!businessId) throw new MissingParamError("businessId");
    if (!tableId) throw new MissingParamError("tableId");
    if (!tableNumber) throw new MissingParamError("tableNumber");
  }
}

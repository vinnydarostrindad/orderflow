import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class OrderItem {
  constructor({
    id,
    orderId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes,
  } = {}) {
    this.validate(id, menuItemId, orderId, quantity, unitPrice, totalPrice);

    this.id = id;
    this.orderId = orderId;
    this.menuItemId = menuItemId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = totalPrice;
    this.notes = notes;
  }

  validate(id, menuItemId, orderId, quantity, unitPrice, totalPrice) {
    if (!id) throw new MissingParamError("id");
    if (!menuItemId) throw new MissingParamError("menuItemId");
    if (!orderId) throw new MissingParamError("orderId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!unitPrice) throw new MissingParamError("unitPrice");
    if (!totalPrice) throw new MissingParamError("totalPrice");
  }
}

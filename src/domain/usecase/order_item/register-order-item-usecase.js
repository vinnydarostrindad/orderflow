import OrderItem from "../../entities/order-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterOrderItemUseCase {
  constructor({ idGenerator, orderItemRepository } = {}) {
    this.idGenerator = idGenerator;
    this.orderItemRepository = orderItemRepository;
  }

  async execute({
    tableSessionId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes,
  } = {}) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!menuItemId) throw new MissingParamError("menuItemId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!unitPrice) throw new MissingParamError("unitPrice");
    if (!totalPrice) throw new MissingParamError("totalPrice");

    const id = this.idGenerator.execute();

    const orderItem = new OrderItem({
      id,
      tableSessionId,
      menuItemId,
      quantity,
      unitPrice,
      totalPrice,
      notes,
    });

    const createdOrderItem = await this.orderItemRepository.create(orderItem);

    return createdOrderItem;
  }
}

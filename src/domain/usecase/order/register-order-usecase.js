import Order from "../../entities/order.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterOrderUseCase {
  constructor({ idGenerator, orderRepository } = {}) {
    this.idGenerator = idGenerator;
    this.orderRepository = orderRepository;
  }

  async execute({ businessId, tableId, tableNumber } = {}) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!tableId) throw new MissingParamError("tableId");
    if (!tableNumber) throw new MissingParamError("tableNumber");

    const id = this.idGenerator.execute();

    const order = new Order({
      id,
      businessId,
      tableId,
      tableNumber,
    });

    const createdOrder = await this.orderRepository.create(order);

    return createdOrder;
  }
}

import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetOrderUseCase {
  constructor({ orderRepository } = {}) {
    this.orderRepository = orderRepository;
  }

  async execute(tableId, orderId) {
    if (!tableId) throw new MissingParamError("tableId");

    if (!orderId) {
      const orders = await this.orderRepository.findAll(tableId);

      return orders;
    }

    const order = await this.orderRepository.findById(tableId, orderId);

    return order;
  }
}

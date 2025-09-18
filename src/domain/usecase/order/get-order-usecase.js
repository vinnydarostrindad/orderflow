export default class GetOrderUseCase {
  constructor({ orderRepository } = {}) {
    this.orderRepository = orderRepository;
  }

  async execute({ businessId, tableId, orderId }) {
    if (!tableId) {
      const order = await this.orderRepository.findByBusinessId(
        businessId,
        orderId,
      );

      return order;
    }

    if (!orderId) {
      const orders = await this.orderRepository.findAll(tableId);

      return orders;
    }

    const order = await this.orderRepository.findByTableId(tableId, orderId);

    return order;
  }
}

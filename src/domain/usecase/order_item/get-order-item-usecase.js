import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetMenuItemUseCase {
  constructor({ orderItemRepository } = {}) {
    this.orderItemRepository = orderItemRepository;
  }

  async execute({ businessId, orderId, orderItemId }) {
    if (!orderId) {
      if (!businessId) throw new MissingParamError("businessId");

      const orderedItems =
        await this.orderItemRepository.findAllByBusinessId(businessId);

      return orderedItems;
    }

    if (!orderItemId) {
      const orderItems = await this.orderItemRepository.findAll(orderId);

      if (!orderItems) return null;

      return orderItems;
    }

    const orderItem = await this.orderItemRepository.findById(
      orderId,
      orderItemId,
    );

    if (!orderItem) return null;

    return orderItem;
  }
}

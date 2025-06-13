import Order from "../../entities/order.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

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
    if (!id) throw new DependencyError("idGenerator");

    const order = new Order({
      id,
      businessId,
      tableId,
      tableNumber,
    });

    const result = await this.orderRepository.create(order);
    if (!result) throw new RepositoryError("order");

    return result;
  }
}

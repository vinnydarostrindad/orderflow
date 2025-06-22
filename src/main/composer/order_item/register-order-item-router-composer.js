import RegisterOrderItemRouter from "../../../presentation/routers/order_item/register-order-item-router.js";
import RegisterOrderItemUseCase from "../../../domain/usecase/order_item/register-order-item-usecase.js";
import validators from "../../../utils/validator.js";
import OrderItemRepository from "../../../infra/repositories/order-item-repository.js";
import idGenerator from "../../../utils/id-generator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const registerOrderItemRouterComposer = {
  execute() {
    const orderItemRepository = new OrderItemRepository({ postgresAdapter });
    const registerOrderItemUseCase = new RegisterOrderItemUseCase({
      idGenerator,
      orderItemRepository,
    });
    const registerOrderItemRouter = new RegisterOrderItemRouter({
      registerOrderItemUseCase,
      validators,
    });
    return registerOrderItemRouter;
  },
};

export default registerOrderItemRouterComposer;

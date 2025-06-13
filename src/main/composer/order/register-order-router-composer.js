import RegisterOrderRouter from "../../../presentation/routers/order/register-order-router.js";
import RegisterOrderUseCase from "../../../domain/usecase/order/register-order-usecase.js";
import OrderRepository from "../../../infra/repositories/order-repository.js";
import idGenerator from "../../../utils/id-generator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const registerOrderRouterComposer = {
  execute() {
    const orderRepository = new OrderRepository({ postgresAdapter });
    const registerOrderUseCase = new RegisterOrderUseCase({
      idGenerator,
      orderRepository,
    });
    const registerOrderRouter = new RegisterOrderRouter({
      registerOrderUseCase,
    });
    return registerOrderRouter;
  },
};

export default registerOrderRouterComposer;

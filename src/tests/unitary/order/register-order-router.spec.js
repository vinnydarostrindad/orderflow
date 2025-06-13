import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import RegisterOrderRouter from "../../../presentation/routers/order/register-order-router.js";

const makeSut = () => {
  const registerOrderUseCaseSpy = makeRegisterOrderUseCase();
  const sut = new RegisterOrderRouter({
    registerOrderUseCase: registerOrderUseCaseSpy,
  });
  return { sut, registerOrderUseCaseSpy };
};

const makeRegisterOrderUseCase = () => {
  class RegisterOrderUseCaseSpy {
    async execute({ tableId, businessId, tableNumber }) {
      this.tableId = tableId;
      this.businessId = businessId;
      this.tableNumber = tableNumber;
      return this.order;
    }
  }

  const registerOrderUseCaseSpy = new RegisterOrderUseCaseSpy();
  registerOrderUseCaseSpy.order = {
    id: "any_order_id",
    tableId: "any_table_id",
    businessId: "any_business_id",
    tableNumber: "any_table_number",
    status: "pending",
    orderTotal: 0,
  };
  return registerOrderUseCaseSpy;
};

const makeRegisterOrderUseCaseWithError = () => {
  class RegisterOrderUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new RegisterOrderUseCaseSpy();
};

describe("RegisterOrderRouter", () => {
  test("Should return 400 if no tableId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { tableNumber: "any_table_number" },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableId"));
  });

  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { tableId: "any_table_id" },
      body: { tableNumber: "any_table_number" },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 400 if no tableNumber is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { tableId: "any_table_id", businessId: "any_business_id" },
      body: {},
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableNumber"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route();
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { tableId: "any_table_id", businessId: "any_business_id" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: { tableNumber: "any_table_number" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if no order is returned", async () => {
    const { sut, registerOrderUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { tableId: "any_table_id", businessId: "any_business_id" },
      body: { tableNumber: "any_table_number" },
    };
    registerOrderUseCaseSpy.order = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call registerOrderUseCase with correct params", async () => {
    const { sut, registerOrderUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { tableId: "any_table_id", businessId: "any_business_id" },
      body: { tableNumber: "any_table_number" },
    };

    await sut.route(httpRequest);
    expect(registerOrderUseCaseSpy.tableId).toBe("any_table_id");
    expect(registerOrderUseCaseSpy.businessId).toBe("any_business_id");
    expect(registerOrderUseCaseSpy.tableNumber).toBe("any_table_number");
  });

  test("Should return 201 with created order if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { tableId: "any_table_id", businessId: "any_business_id" },
      body: { tableNumber: "any_table_number" },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_order_id",
      tableId: "any_table_id",
      businessId: "any_business_id",
      tableNumber: "any_table_number",
      status: "pending",
      orderTotal: 0,
    });
  });

  test("Should return 500 if invalid dependency is provided", async () => {
    const suts = [
      new RegisterOrderRouter(),
      new RegisterOrderRouter({}),
      new RegisterOrderRouter({ registerOrderUseCase: {} }),
    ];

    const httpRequest = {
      params: { tableId: "any_table_id", businessId: "any_business_id" },
      body: { tableNumber: "any_table_number" },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should return 500 if any dependency throws", async () => {
    const sut = new RegisterOrderRouter({
      registerOrderUseCase: makeRegisterOrderUseCaseWithError(),
    });

    const httpRequest = {
      params: { tableId: "any_table_id", businessId: "any_business_id" },
      body: { tableNumber: "any_table_number" },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });
});

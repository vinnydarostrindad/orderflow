import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import RegisterMenuRouter from "../../../presentation/routers/menu/register-menu-router.js";

const makeSut = () => {
  const registerMenuUseCaseSpy = makeRegisterMenuUseCase();
  const sut = new RegisterMenuRouter({
    registerMenuUseCase: registerMenuUseCaseSpy,
  });
  return { sut, registerMenuUseCaseSpy };
};

const makeRegisterMenuUseCase = () => {
  class RegisterMenuUseCaseSpy {
    async execute({ businessId, name }) {
      this.businessId = businessId;
      this.name = name;
      return this.menu;
    }
  }

  const registerMenuUseCaseSpy = new RegisterMenuUseCaseSpy();
  registerMenuUseCaseSpy.menu = {
    id: "any_menu_id",
    businessId: "any_business_id",
    name: "any_name",
  };
  return registerMenuUseCaseSpy;
};

const makeRegisterMenuUseCaseWithError = () => {
  class RegisterMenuUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new RegisterMenuUseCaseSpy();
};

describe("Register Menu Router", () => {
  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {},
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
      body: { name: "any_name" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route();
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should return 500 if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should return 500 if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should return Error if no menu is returned", async () => {
    const { sut, registerMenuUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { name: "any_name" },
    };
    registerMenuUseCaseSpy.menu = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should call registerMenuUseCase with correct params", async () => {
    const { sut, registerMenuUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
      },
    };
    await sut.route(httpRequest);
    expect(registerMenuUseCaseSpy.businessId).toBe("any_business_id");
    expect(registerMenuUseCaseSpy.name).toBe("any_name");
  });

  test("Should return 201 with created menu if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_menu_id",
      businessId: "any_business_id",
      name: "any_name",
    });
  });

  test("Should return 500 if invalid dependency is provided", async () => {
    const suts = [
      new RegisterMenuRouter(),
      new RegisterMenuRouter({}),
      new RegisterMenuRouter({
        registerMenuUseCase: {},
      }),
    ];
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { name: "any_name" },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toBeInstanceOf(ServerError);
    }
  });

  test("Should return 500 if any dependency throws", async () => {
    const suts = [
      new RegisterMenuRouter({
        registerMenuUseCase: makeRegisterMenuUseCaseWithError(),
      }),
    ];
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { name: "any_name" },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toBeInstanceOf(ServerError);
    }
  });
});

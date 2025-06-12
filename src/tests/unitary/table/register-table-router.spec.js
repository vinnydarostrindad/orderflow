import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import RegisterTableRouter from "../../../presentation/routers/table/register-table-router.js";

const makeSut = () => {
  const registerTableUseCaseSpy = makeRegisterTableUseCase();
  const sut = new RegisterTableRouter({
    registerTableUseCase: registerTableUseCaseSpy,
  });
  return { sut, registerTableUseCaseSpy };
};

const makeRegisterTableUseCase = () => {
  class RegisterTableUseCaseSpy {
    async execute({ businessId, number, name }) {
      this.businessId = businessId;
      this.number = number;
      this.name = name;
      return this.table;
    }
  }

  const registerTableUseCaseSpy = new RegisterTableUseCaseSpy();
  registerTableUseCaseSpy.table = {
    id: "any_table_id",
    businessId: "any_business_id",
    number: "any_number",
    name: "any_name",
  };
  return registerTableUseCaseSpy;
};

const makeRegisterTableUseCaseWithError = () => {
  class RegisterTableUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new RegisterTableUseCaseSpy();
};

describe("Register Table Router", () => {
  test("Should return 400 if no number is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { name: "any_name" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("number"));
  });

  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
      body: { number: "any_number", name: "any_name" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
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
      params: { businessId: "any_business_id" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: { number: "any_number", name: "any_name" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if no table is returned", async () => {
    const { sut, registerTableUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { number: "any_number", name: "any_name" },
    };
    registerTableUseCaseSpy.table = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call registerTableUseCase with correct params", async () => {
    const { sut, registerTableUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        number: "any_number",
        name: "any_name",
      },
    };
    await sut.route(httpRequest);
    expect(registerTableUseCaseSpy.businessId).toBe("any_business_id");
    expect(registerTableUseCaseSpy.number).toBe("any_number");
    expect(registerTableUseCaseSpy.name).toBe("any_name");
  });

  test("Should return 201 with created table if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        number: "any_number",
        name: "any_name",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_table_id",
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    });
  });

  test("Should return 500 if invalid dependency is provided", async () => {
    const suts = [
      new RegisterTableRouter(),
      new RegisterTableRouter({}),
      new RegisterTableRouter({
        registerTableUseCase: {},
      }),
    ];
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { number: "any_number", name: "any_name" },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should return 500 if any dependency throws", async () => {
    const suts = [
      new RegisterTableRouter({
        registerTableUseCase: makeRegisterTableUseCaseWithError(),
      }),
    ];
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { number: "any_number", name: "any_name" },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});

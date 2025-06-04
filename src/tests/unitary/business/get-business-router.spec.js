import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import GetBusinessRouter from "../../../presentation/routers/get-business-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";

const makeSut = () => {
  const getBusinessUseCaseSpy = makeGetBusinessUseCase();
  const sut = new GetBusinessRouter({
    getBusinessUseCase: getBusinessUseCaseSpy,
  });
  return {
    sut,
    getBusinessUseCaseSpy,
  };
};

const makeGetBusinessUseCase = () => {
  class GetBusinessUseCaseSpy {
    execute(id) {
      this.id = id;
      return this.business;
    }
  }

  const getBusinessUseCaseSpy = new GetBusinessUseCaseSpy();
  getBusinessUseCaseSpy.business = {
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
  };
  return getBusinessUseCaseSpy;
};
const makeGetBusinessUseCaseWithError = () => {
  class GetBusinessUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetBusinessUseCaseSpy();
};

describe("Get Business Router", () => {
  test("Should return 400 if no id is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = { body: {} };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("id"));
  });

  test("Should return 404 if no business is found", async () => {
    const { sut, getBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        id: "any_id",
      },
    };
    getBusinessUseCaseSpy.business = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body).toEqual(new NotFoundError("Business"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.route();

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if no httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {};
    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call getBusinessUseCase with correct value", async () => {
    const { sut, getBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        id: "any_id",
      },
    };

    await sut.route(httpRequest);
    expect(getBusinessUseCaseSpy.id).toBe("any_id");
  });

  test("Should return 200 with business correctly", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        id: "any_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({
      id: "any_id",
      name: "any_name",
      email: "any_email@mail.com",
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetBusinessRouter(),
      new GetBusinessRouter({}),
      new GetBusinessRouter({
        getBusinessUseCase: {},
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        body: {
          id: "any_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetBusinessRouter({
        getBusinessUseCase: makeGetBusinessUseCaseWithError(),
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        body: {
          id: "any_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});

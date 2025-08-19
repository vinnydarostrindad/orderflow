import MissingParamError from "../../../utils/errors/missing-param-error.js";
import GetBusinessRouter from "../../../presentation/routers/business/get-business-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const getBusinessUseCaseSpy = makeGetBusinessUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetBusinessRouter({
    getBusinessUseCase: getBusinessUseCaseSpy,
    validators: validatorsSpy,
  });
  return {
    sut,
    getBusinessUseCaseSpy,
    validatorsSpy,
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

const makeValidators = () => {
  const validatorsSpy = {
    uuid(uuidValue) {
      this.uuidValue = uuidValue;
      return this.isValid;
    },
  };

  validatorsSpy.isValid = true;
  return validatorsSpy;
};

const makeValidatorsWithError = () => {
  const validatorsSpy = {
    uuid() {
      throw new Error();
    },
  };

  return validatorsSpy;
};

describe("Get Business Router", () => {
  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = { auth: {} };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 400 if businessId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = { auth: { businessId: "invalid_business_id" } };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
  });

  test("Should return 404 if no business is found", async () => {
    const { sut, getBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      auth: {
        businessId: "any_id",
      },
    };
    getBusinessUseCaseSpy.business = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body).toEqual(
      new NotFoundError({ resource: "Business" }),
    );
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no auth", async () => {
    const { sut } = makeSut();
    const httpRequest = {};

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should call getBusinessUseCase with correct value", async () => {
    const { sut, getBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      auth: {
        businessId: "any_id",
      },
    };

    await sut.route(httpRequest);
    expect(getBusinessUseCaseSpy.id).toBe("any_id");
  });

  test("Should return 200 with business correctly", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      auth: {
        businessId: "any_id",
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
      new GetBusinessRouter({
        getBusinessUseCase: makeGetBusinessUseCase(),
        valators: {},
      }),
    ];

    const httpRequest = {
      auth: {
        businessId: "any_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetBusinessRouter({
        getBusinessUseCase: makeGetBusinessUseCaseWithError(),
      }),
      new GetBusinessRouter({
        getBusinessUseCase: makeGetBusinessUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      auth: {
        businessId: "any_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});

import MissingParamError from "../../../utils/errors/missing-param-error.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import GetTableRouter from "../../../presentation/routers/table/get-table-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const getTableUseCaseSpy = makeGetTableUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetTableRouter({
    getTableUseCase: getTableUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, getTableUseCaseSpy, validatorsSpy };
};

const makeGetTableUseCase = () => {
  class GetTableUseCaseSpy {
    async execute(businessId, tableId) {
      this.businessId = businessId;
      if (!tableId) return this.tables;

      this.tableId = tableId;
      return this.table;
    }
  }

  const getTableUseCaseSpy = new GetTableUseCaseSpy();
  getTableUseCaseSpy.table = {
    businessId: "any_business_id",
    id: "any_table_id",
    number: "1",
    name: "any_table_name",
  };
  getTableUseCaseSpy.tables = [
    {
      businessId: "any_business_id",
      id: "any_table_id",
      number: "1",
      name: "any_table_name",
    },
  ];
  return getTableUseCaseSpy;
};

const makeGetTableUseCaseWithError = () => {
  class GetTableUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetTableUseCaseSpy();
};

const makeValidators = () => {
  const validatorsSpy = {
    uuid(uuidValue) {
      if (this.isValid === false) {
        return uuidValue.split("_")[0] === "valid" ? true : false;
      }

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

describe("Get Table Router", () => {
  describe("Without tableId", () => {
    test("Should call getTableUseCase with correct value", async () => {
      const { sut, getTableUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
        },
      };

      await sut.route(httpRequest);
      expect(getTableUseCaseSpy.businessId).toBe("any_business_id");
      expect(getTableUseCaseSpy.tableId).toBeUndefined();
    });

    test("Should return 200 and a array of tables", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
      expect(httpResponse.body[0]).toEqual({
        id: "any_table_id",
        businessId: "any_business_id",
        number: "1",
        name: "any_table_name",
      });
    });
  });

  describe("With tableId", () => {
    test("Should return 400 if tableId is invalid", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "valid_business_id",
          tableId: "invalid_order_id",
        },
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError("tableId"));
    });

    test("Should return 404 if no table is found", async () => {
      const { sut, getTableUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
          tableId: "any_table_id",
        },
      };
      getTableUseCaseSpy.table = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(
        new NotFoundError({ resource: "Table" }),
      );
    });

    test("Should call getTableUseCase with correct values", async () => {
      const { sut, getTableUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
          tableId: "any_table_id",
        },
      };

      await sut.route(httpRequest);
      expect(getTableUseCaseSpy.businessId).toBe("any_business_id");
      expect(getTableUseCaseSpy.tableId).toBe("any_table_id");
    });

    test("Should return 200 with table correctly", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
          tableId: "any_table_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_table_id",
        businessId: "any_business_id",
        number: "1",
        name: "any_table_name",
      });
    });
  });

  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {
        tableId: "any_table_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 400 if businessId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "invalid_business_id" },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {};
    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetTableRouter(),
      new GetTableRouter({}),
      new GetTableRouter({
        getTableUseCase: {},
      }),
      new GetTableRouter({
        getTableUseCase: makeGetTableUseCase(),
        validators: {},
      }),
    ];
    const httpRequest = {
      params: {
        businessId: "any_business_id",
        tableId: "any_table_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetTableRouter({
        getTableUseCase: makeGetTableUseCaseWithError(),
      }),
      new GetTableRouter({
        getTableUseCase: makeGetTableUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];
    const httpRequest = {
      params: {
        businessId: "any_business_id",
        tableId: "any_table_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});

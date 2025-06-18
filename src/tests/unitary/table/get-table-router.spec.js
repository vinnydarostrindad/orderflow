import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import GetTableRouter from "../../../presentation/routers/table/get-table-router.js";

const makeSut = () => {
  const getTableUseCaseSpy = makeGetTableUseCase();
  const sut = new GetTableRouter({
    getTableUseCase: getTableUseCaseSpy,
  });
  return {
    sut,
    getTableUseCaseSpy,
  };
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

describe("Get Table Router", () => {
  describe("Without tableId", () => {
    test("Should return 404 if no tables are found", async () => {
      const { sut, getTableUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
        },
      };
      getTableUseCaseSpy.tables = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(new NotFoundError("Table"));
    });

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
      expect(httpResponse.body).toEqual(new NotFoundError("Table"));
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

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route();

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should return 500 if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {};
    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should return 500 if invalid dependency is provided", async () => {
    const suts = [
      new GetTableRouter(),
      new GetTableRouter({}),
      new GetTableRouter({
        getTableUseCase: {},
      }),
    ];
    const httpRequest = {
      params: {
        businessId: "any_business_id",
        tableId: "any_table_id",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toBeInstanceOf(ServerError);
    }
  });

  test("Should return 500 if dependency throws", async () => {
    const suts = [
      new GetTableRouter({
        getTableUseCase: makeGetTableUseCaseWithError(),
      }),
    ];
    const httpRequest = {
      params: {
        businessId: "any_business_id",
        tableId: "any_table_id",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toBeInstanceOf(ServerError);
    }
  });
});

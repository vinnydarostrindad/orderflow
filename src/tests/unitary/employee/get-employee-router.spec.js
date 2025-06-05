import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import GetEmployeeRouter from "../../../presentation/routers/get-employee-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";

const makeSut = () => {
  const getEmployeeUseCaseSpy = makeGetEmployeeUseCase();
  const sut = new GetEmployeeRouter({
    getEmployeeUseCase: getEmployeeUseCaseSpy,
  });
  return {
    sut,
    getEmployeeUseCaseSpy,
  };
};

const makeGetEmployeeUseCase = () => {
  class GetEmployeeUseCaseSpy {
    async execute(business_id, employee_id) {
      this.business_id = business_id;
      if (!employee_id) {
        return this.employees;
      }

      this.employee_id = employee_id;
      return this.employee;
    }
  }

  const getEmployeeUseCaseSpy = new GetEmployeeUseCaseSpy();
  getEmployeeUseCaseSpy.employee = {
    business_id: "any_business_id",
    id: "any_employee_id",
    name: "any_name",
    role: "any_role",
  };
  getEmployeeUseCaseSpy.employees = [
    {
      business_id: "any_business_id",
      id: "any_employee_id",
      name: "any_name",
      role: "any_role",
    },
  ];
  return getEmployeeUseCaseSpy;
};
const makeGetEmployeeUseCaseWithError = () => {
  class GetEmployeeUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetEmployeeUseCaseSpy();
};

describe("Get Employee Router", () => {
  describe("Without employee_id", () => {
    test("Should return 404 if no employees are found", async () => {
      const { sut, getEmployeeUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          business_id: "any_business_id",
        },
      };
      getEmployeeUseCaseSpy.employees = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(new NotFoundError("Employee"));
    });

    test("Should call getEmployeeUseCase with correct value", async () => {
      const { sut, getEmployeeUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          business_id: "any_business_id",
        },
      };

      await sut.route(httpRequest);
      expect(getEmployeeUseCaseSpy.business_id).toBe("any_business_id");
      expect(getEmployeeUseCaseSpy.employee_id).toBeUndefined();
    });

    test("Should return 200 and a array of employees", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          business_id: "any_business_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
    });
  });
  describe("With employee_id", () => {
    test("Should return 404 if no employee is found", async () => {
      const { sut, getEmployeeUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          business_id: "any_business_id",
          employee_id: "any_employee_id",
        },
      };
      getEmployeeUseCaseSpy.employee = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(new NotFoundError("Employee"));
    });

    test("Should call getEmployeeUseCase with correct value", async () => {
      const { sut, getEmployeeUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          business_id: "any_business_id",
          employee_id: "any_employee_id",
        },
      };

      await sut.route(httpRequest);
      expect(getEmployeeUseCaseSpy.business_id).toBe("any_business_id");
      expect(getEmployeeUseCaseSpy.employee_id).toBe("any_employee_id");
    });

    test("Should return 200 with employee correctly", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          business_id: "any_business_id",
          employee_id: "any_employee_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_employee_id",
        business_id: "any_business_id",
        name: "any_name",
        role: "any_role",
      });
    });
  });

  test("Should return 400 if no business_id is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {
        employee_id: "any_employee_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("business_id"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.route();

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if no httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {};
    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetEmployeeRouter(),
      new GetEmployeeRouter({}),
      new GetEmployeeRouter({
        getEmployeeUseCase: {},
      }),
    ];
    const httpRequest = {
      params: {
        business_id: "any_business_id",
        employee_id: "any_employee_id",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetEmployeeRouter({
        getEmployeeUseCase: makeGetEmployeeUseCaseWithError(),
      }),
    ];
    const httpRequest = {
      params: {
        business_id: "any_business_id",
        employee_id: "any_employee_id",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});

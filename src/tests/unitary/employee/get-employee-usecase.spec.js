import MissingParamError from "../../../utils/errors/missing-param-error.js";
import GetEmployeeUseCase from "../../../domain/usecase/employee/get-employee-usecase.js";

const makeSut = () => {
  const employeeRepositorySpy = makeEmployeeRepository();
  const sut = new GetEmployeeUseCase({
    employeeRepository: employeeRepositorySpy,
  });
  return {
    sut,
    employeeRepositorySpy,
  };
};

const makeEmployeeRepository = () => {
  class EmployeeRepositorySpy {
    async findAll(businessId) {
      this.businessId = businessId;
      return this.employees;
    }

    async findById(businessId, employeeId) {
      this.businessId = businessId;
      this.employeeId = employeeId;
      return this.employee;
    }
  }

  const employeeRepositorySpy = new EmployeeRepositorySpy();
  employeeRepositorySpy.employee = {
    businessId: "any_business_id",
    id: "any_employee_id",
    name: "any_name",
    role: "any_role",
  };
  employeeRepositorySpy.employees = [
    {
      businessId: "any_business_id",
      id: "any_employee_id",
      name: "any_name",
      role: "any_role",
    },
  ];
  return employeeRepositorySpy;
};

const makeEmployeeRepositoryWithError = () => {
  class EmployeeRepositorySpy {
    findById() {
      throw new Error();
    }
    findAll() {
      throw new Error();
    }
  }

  return new EmployeeRepositorySpy();
};

describe("Get Employee Usecase", () => {
  describe("Without employeeId", () => {
    test("Should return null if employees is invalid", async () => {
      const { sut, employeeRepositorySpy } = makeSut();
      employeeRepositorySpy.employees = null;

      const employees = await sut.execute("any_business_id");
      expect(employees).toBeNull();
    });

    test("Should call employeeRepository.findAll with correct value", async () => {
      const { sut, employeeRepositorySpy } = makeSut();

      await sut.execute("any_business_id");
      expect(employeeRepositorySpy.businessId).toBe("any_business_id");
    });

    test("Should return an array of employees", async () => {
      const { sut } = makeSut();

      const employees = await sut.execute("any_business_id");
      expect(Array.isArray(employees)).toBe(true);
    });
  });
  describe("With employeeId", () => {
    test("Should return null if no employee is found", async () => {
      const { sut, employeeRepositorySpy } = makeSut();
      employeeRepositorySpy.employee = null;

      const employee = await sut.execute("any_business_id", "any_employee_id");
      expect(employee).toBeNull();
    });

    test("Should call employeeRepository.findById with correct value", async () => {
      const { sut, employeeRepositorySpy } = makeSut();

      await sut.execute("any_business_id", "any_employee_id");
      expect(employeeRepositorySpy.businessId).toBe("any_business_id");
      expect(employeeRepositorySpy.employeeId).toBe("any_employee_id");
    });

    test("Should return employee correctly", async () => {
      const { sut } = makeSut();

      const employee = await sut.execute("any_business_id", "any_employee_id");
      expect(employee).toEqual({
        id: "any_employee_id",
        businessId: "any_business_id",
        name: "any_name",
        role: "any_role",
      });
    });
  });

  test("Should throw if no businessId is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.execute(undefined, "any_employee_id")).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetEmployeeUseCase(),
      new GetEmployeeUseCase({}),
      new GetEmployeeUseCase({
        employeeRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute("any_business_id", "any_employee_id"),
      ).rejects.toThrow(TypeError);
      await expect(sut.execute("any_business_id")).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetEmployeeUseCase({
        employeeRepository: makeEmployeeRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute("any_business_id", "any_employee_id"),
      ).rejects.toThrow(new Error());
      await expect(sut.execute("any_business_id")).rejects.toThrow(new Error());
    }
  });
});

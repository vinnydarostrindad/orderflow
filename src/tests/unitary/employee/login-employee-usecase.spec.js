import LoginEmployeeUseCase from "../../../domain/usecase/employee/login-employee-usecase.js";
import InvalidCredentialsError from "../../../utils/errors/invalid-credentials-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const employeeRepositorySpy = makeEmployeeRepository();
  const authUseCaseSpy = makeAuthUseCase();
  const sut = new LoginEmployeeUseCase({
    employeeRepository: employeeRepositorySpy,
    authUseCase: authUseCaseSpy,
  });
  return {
    sut,
    employeeRepositorySpy,
    authUseCaseSpy,
  };
};

const makeEmployeeRepository = () => {
  class EmployeeRepository {
    findByNameAndRole(businessId, name) {
      this.businessId = businessId;
      this.name = name;
      return this.employee;
    }
  }

  const employeeRepository = new EmployeeRepository();
  employeeRepository.employee = {
    id: "any_employee_id",
    name: "any_name",
    businessId: "any_business_id",
    role: "any_role",
  };
  return employeeRepository;
};

const makeEmployeeRepositoryWithError = () => {
  class EmployeeRepository {
    findByNameAndRole() {
      throw new Error();
    }
  }

  return new EmployeeRepository();
};

const makeAuthUseCase = () => {
  class AuthUseCase {
    generateToken(payload) {
      this.payload = payload;
      return this.token;
    }
  }

  const authUseCase = new AuthUseCase();
  authUseCase.token = "any_token";
  return authUseCase;
};

const makeAuthUseCaseWithError = () => {
  class AuthUseCase {
    generateToken() {
      throw new Error();
    }
  }

  return new AuthUseCase();
};

describe("LoginEmployeeUseCase", () => {
  test("Should throw if no name is provided", async () => {
    const { sut } = makeSut();
    const props = {
      role: "any_role",
      businessId: "any_business_id",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("name"),
    );
  });

  test("Should throw if no role is provided", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      businessId: "any_business_id",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("role"),
    );
  });

  test("Should throw if no businessId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      role: "any_role",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should return token if everithing is right", async () => {
    const { sut } = makeSut();
    const props = {
      name: "valid_name",
      role: "valid_role",
      businessId: "valid_business_id",
    };

    const token = await sut.execute(props);
    expect(token).toBe("any_token");
  });

  test("Should throw if employeeRepository returns invalid employee", async () => {
    const { sut, employeeRepositorySpy } = makeSut();
    const props = {
      name: "any_name",
      role: "any_role",
      businessId: "any_business_id",
    };
    employeeRepositorySpy.employee = null;

    await expect(sut.execute(props)).rejects.toThrow(
      new InvalidCredentialsError(),
    );
  });

  test("Should return null if authUseCase returns invalid token", async () => {
    const { sut, authUseCaseSpy } = makeSut();
    const props = {
      name: "valid_name",
      role: "valid_role",
      businessId: "valid_business_id",
    };
    authUseCaseSpy.token = null;

    const token = await sut.execute(props);
    expect(token).toBeNull();
  });

  test("Should throw if no props is provided", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow();
  });

  test("Should call employeeRepository.findByNameAndRole with correct values", async () => {
    const { sut, employeeRepositorySpy } = makeSut();
    const props = {
      name: "any_name",
      role: "any_role",
      businessId: "any_business_id",
    };

    await sut.execute(props);
    expect(employeeRepositorySpy.name).toBe("any_name");
    expect(employeeRepositorySpy.businessId).toBe("any_business_id");
  });

  test("Should call authUseCase.generateToken with correct values", async () => {
    const { sut, authUseCaseSpy } = makeSut();
    const props = {
      name: "any_name",
      role: "any_role",
      businessId: "any_business_id",
    };

    await sut.execute(props);
    expect(authUseCaseSpy.payload).toEqual({
      employeeId: "any_employee_id",
      role: "any_role",
      businessId: "any_business_id",
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const employeeRepository = makeEmployeeRepository();
    const suts = [
      new LoginEmployeeUseCase(),
      new LoginEmployeeUseCase({}),
      new LoginEmployeeUseCase({
        employeeRepository,
      }),
      new LoginEmployeeUseCase({
        employeeRepository,
        authUseCase: {},
      }),
    ];
    const props = {
      name: "any_name",
      role: "any_role",
      businessId: "any_business_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const employeeRepository = makeEmployeeRepository();
    const suts = [
      new LoginEmployeeUseCase({
        employeeRepository: makeEmployeeRepositoryWithError(),
      }),
      new LoginEmployeeUseCase({
        employeeRepository,
        authUseCase: makeAuthUseCaseWithError(),
      }),
    ];

    const props = {
      name: "any_name",
      role: "any_role",
      businessId: "any_business_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toMatchObject({ name: "Error" });
    }
  });
});

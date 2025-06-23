import RegisterEmployeeUseCase from "../../../domain/usecase/employee/register-employee-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const cryptoSpy = makeCrypto();
  const idGeneratorSpy = makeIdGenerator();
  const employeeRepositorySpy = makeEmployeeRepository();
  const sut = new RegisterEmployeeUseCase({
    crypto: cryptoSpy,
    idGenerator: idGeneratorSpy,
    employeeRepository: employeeRepositorySpy,
  });
  return {
    sut,
    cryptoSpy,
    idGeneratorSpy,
    employeeRepositorySpy,
  };
};

const makeCrypto = () => {
  const cryptoSpy = {
    hash(password) {
      this.password = password;
      return this.hashedPassword;
    },
  };

  cryptoSpy.hashedPassword = "any_hash";
  return cryptoSpy;
};

const makeCryptoWithError = () => {
  return {
    hash() {
      throw new Error();
    },
  };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_employee_id";
  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makeEmployeeRepository = () => {
  const employeeRepositorySpy = {
    create({ id, businessId, name, role, hashedPassword }) {
      this.id = id;
      this.businessId = businessId;
      this.name = name;
      this.role = role;
      this.password = hashedPassword;
      return this.employee;
    },
  };

  employeeRepositorySpy.employee = {
    id: "any_employee_id",
    businessId: "any_business_id",
    name: "any_name",
    role: "any_role",
    password: "any_hash",
  };
  return employeeRepositorySpy;
};

const makeEmployeeRepositoryWithError = () => {
  return {
    create() {
      throw new Error();
    },
  };
};

describe("Register Employee UseCase", () => {
  test("Should throw if no props are provided ", async () => {
    const { sut } = makeSut();

    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if no name is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
      role: "any_role",
      password: "any_password",
    };

    expect(sut.execute(props)).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no role is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
      name: "any_name",
      password: "any_password",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("role"),
    );
  });

  test("Should throw if no password is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("password"),
    );
  });

  test("Should throw if no businessId is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      role: "any_role",
      password: "any_password",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should call crypto with correct password", async () => {
    const { sut, cryptoSpy } = makeSut();
    const props = {
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      password: "any_password",
    };
    await sut.execute(props);

    expect(cryptoSpy.password).toBe(props.password);
  });

  test("Should call employeeRepository with correct values", async () => {
    const { sut, employeeRepositorySpy, cryptoSpy, idGeneratorSpy } = makeSut();
    const props = {
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      password: "any_password",
    };

    await sut.execute(props);
    expect(employeeRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(employeeRepositorySpy.businessId).toBe("any_business_id");
    expect(employeeRepositorySpy.name).toBe("any_name");
    expect(employeeRepositorySpy.role).toBe("any_role");
    expect(employeeRepositorySpy.password).toBe(cryptoSpy.hashedPassword);
  });

  test("Should return employee if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      password: "any_password",
    };

    const employee = await sut.execute(props);
    expect(employee).toEqual({
      id: "any_employee_id",
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      password: "any_hash",
    });
  });

  test("Should throw if invalid denpencies are provided", async () => {
    const crypto = makeCrypto();
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterEmployeeUseCase(),
      new RegisterEmployeeUseCase({}),
      new RegisterEmployeeUseCase({
        crypto: {},
      }),
      new RegisterEmployeeUseCase({
        crypto,
      }),
      new RegisterEmployeeUseCase({
        crypto,
        idGenerator: {},
      }),
      new RegisterEmployeeUseCase({
        crypto,
        idGenerator,
      }),
      new RegisterEmployeeUseCase({
        crypto,
        idGenerator,
        employeeRepository: {},
      }),
    ];
    const props = {
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      password: "any_password",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const crypto = makeCrypto();
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterEmployeeUseCase({
        crypto: makeCryptoWithError(),
      }),
      new RegisterEmployeeUseCase({
        crypto,
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterEmployeeUseCase({
        crypto,
        idGenerator,
        employeeRepository: makeEmployeeRepositoryWithError(),
      }),
    ];
    const props = {
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      password: "any_password",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});

import EmployeeRepository from "../../../infra/repositories/employee-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new EmployeeRepository({
    postgresAdapter: postgresAdapterSpy,
  });
  return {
    sut,
    postgresAdapterSpy,
  };
};

const makePostgresAdapter = () => {
  const postgresAdapterSpy = {
    query(queryObject) {
      this.queryObject = queryObject;
      return this.employee;
    },
  };

  postgresAdapterSpy.employee = {
    rows: [
      {
        id: "any_id",
        business_id: "any_business_id",
        name: "any_name",
        role: "any_role",
        hashedPassword: "any_hash",
      },
    ],
  };
  return postgresAdapterSpy;
};

const makePostgresAdapterWithError = () => {
  return {
    query() {
      throw new Error();
    },
  };
};

describe("Employee Repository", () => {
  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();
    const promise = sut.create();
    // Fazer uma validação de erros melhor
    expect(promise).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", async () => {
    const { sut } = makeSut();
    const props = {
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should throw if no business_id is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("business_id"));
  });

  test("Should throw if no name is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      role: "any_role",
      hashedPassword: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no role is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      hashedPassword: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("role"));
  });

  test("Should throw if no hashedPassword is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("hashedPassword"));
  });

  test("Should call postgresAdapter with correct object ", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };
    await sut.create(props);
    expect(postgresAdapterSpy.queryObject).toEqual({
      text: `
        INSERT INTO
          employees (id, business_id, name, role, password)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
      ;`,
      values: ["any_id", "any_business_id", "any_name", "any_role", "any_hash"],
    });
  });

  test("Should return null if postgresAdapter return invalid employee", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };
    postgresAdapterSpy.employee = null;
    const employee = await sut.create(props);
    expect(employee).toBeNull();
  });

  test("Should return employee if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };

    const employee = await sut.create(props);
    expect(employee).toEqual({
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new EmployeeRepository(),
      new EmployeeRepository({}),
      new EmployeeRepository({
        postgresAdapter: {},
      }),
    ];
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };

    for (const sut of suts) {
      const promise = sut.create(props);
      expect(promise).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new EmployeeRepository({
        postgresAdapter: makePostgresAdapterWithError(),
      }),
    ];
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };

    for (const sut of suts) {
      const promise = sut.create(props);
      expect(promise).rejects.toThrow();
    }
  });
});

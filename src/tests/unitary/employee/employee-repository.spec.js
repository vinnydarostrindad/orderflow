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
    id: "any_id",
    business_id: "any_business_id",
    name: "any_name",
    email: "any_email",
    password: "any_hash",
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
  test("Should throw if no id is provided", async () => {
    const { sut } = makeSut();
    const props = {
      business_id: "any_business_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should throw if no business_id is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("business_id"));
  });

  test("Should throw if no name is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      email: "any_email",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no email is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("email"));
  });

  test("Should throw if no password is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      email: "any_email",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("password"));
  });

  test("Should call postgresAdapter with correct object ", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };
    await sut.create(props);
    expect(postgresAdapterSpy.queryObject).toEqual({
      text: `
        INSERT INTO
          employee (id, business_id, name, email, password)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
      ;`,
      values: [
        "any_id",
        "any_business_id",
        "any_name",
        "any_email",
        "any_hash",
      ],
    });
  });

  test("Should return null if postgresAdapter return invalid employee", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
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
      email: "any_email",
      password: "any_hash",
    };

    const employee = await sut.create(props);
    expect(employee).toEqual({
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
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
      email: "any_email",
      password: "any_hash",
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
      email: "any_email",
      password: "any_hash",
    };

    for (const sut of suts) {
      const promise = sut.create(props);
      expect(promise).rejects.toThrow();
    }
  });
});

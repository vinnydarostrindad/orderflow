import BusinessRepository from "../../infra/repositories/business-repository.js";
import MissingParamError from "../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new BusinessRepository({
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
      return this.user;
    },
  };

  postgresAdapterSpy.user = {
    id: "any_id",
    name: "any_name",
    email: "any_email",
    password: "any_hash",
  };
  return postgresAdapterSpy;
};

describe("Business Repository", () => {
  test("Should throw if no id is provided", () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should throw if no name is provided", () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      email: "any_email",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no email is provided", () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("email"));
  });

  test("Should throw if no password is provided", () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
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
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };
    await sut.create(props);
    expect(postgresAdapterSpy.queryObject).toEqual({
      text: `
        INSERT INTO
          businesses (id, name, email, password)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      ;`,
      values: ["any_id", "any_name", "any_email", "any_hash"],
    });
  });

  test("Should return null if postgresAdapter return invalid user", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };
    postgresAdapterSpy.user = null;
    const user = await sut.create(props);
    expect(user).toBeNull();
  });

  test("Should return user if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };

    const user = await sut.create(props);
    expect(user).toEqual({
      id: "any_id",
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    });
  });
});

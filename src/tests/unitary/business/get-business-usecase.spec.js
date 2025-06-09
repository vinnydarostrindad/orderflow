import MissingParamError from "../../../utils/errors/missing-param-error.js";
import GetBusinessUseCase from "../../../domain/usecase/business/get-business-usecase.js";

const makeSut = () => {
  const businessRepositorySpy = makeBusinessRepository();
  const sut = new GetBusinessUseCase({
    businessRepository: businessRepositorySpy,
  });
  return {
    sut,
    businessRepositorySpy,
  };
};

const makeBusinessRepository = () => {
  class BusinessRepositorySpy {
    findById(id) {
      this.id = id;
      return this.business;
    }
  }

  const businessRepositorySpy = new BusinessRepositorySpy();
  businessRepositorySpy.business = {
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
    password: "any_hash",
  };
  return businessRepositorySpy;
};

const makeBusinessRepositoryWithError = () => {
  class BusinessRepositorySpy {
    findOne() {
      throw new Error();
    }
  }

  return new BusinessRepositorySpy();
};

describe("Get Business UseCase", () => {
  test("Should throw if no id is provided", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should call businessRepository.findOne correctly", async () => {
    const { sut, businessRepositorySpy } = makeSut();
    await sut.execute("any_id");
    expect(businessRepositorySpy.id).toBe("any_id");
  });

  test("Should return null if businessRepository returns invalid user", async () => {
    const { sut, businessRepositorySpy } = makeSut();
    businessRepositorySpy.business = null;
    const business = await sut.execute("any_id");
    expect(business).toBeNull();
  });

  test("Should return business correctly", async () => {
    const { sut } = makeSut();
    const business = await sut.execute("any_id");
    expect(business).toEqual({
      id: "any_id",
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_hash",
    });
  });

  test("Should throw if invalid dependencieses are provided", async () => {
    const suts = [
      new GetBusinessUseCase(),
      new GetBusinessUseCase({}),
      new GetBusinessUseCase({
        businessRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(sut.execute("any_id")).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new GetBusinessUseCase({
        businessRepository: makeBusinessRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(sut.execute("any_id")).rejects.toThrow();
    }
  });
});

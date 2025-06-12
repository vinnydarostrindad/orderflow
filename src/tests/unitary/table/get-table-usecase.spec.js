import MissingParamError from "../../../utils/errors/missing-param-error.js";
import GetTableUseCase from "../../../domain/usecase/table/get-table-usecase.js";

const makeSut = () => {
  const tableRepositorySpy = makeTableRepository();
  const sut = new GetTableUseCase({
    tableRepository: tableRepositorySpy,
  });
  return {
    sut,
    tableRepositorySpy,
  };
};

const makeTableRepository = () => {
  class TableRepositorySpy {
    async findAll(businessId) {
      this.businessId = businessId;
      return this.tables;
    }

    async findById(businessId, tableId) {
      this.businessId = businessId;
      this.tableId = tableId;
      return this.table;
    }
  }

  const tableRepositorySpy = new TableRepositorySpy();
  tableRepositorySpy.table = {
    businessId: "any_business_id",
    id: "any_table_id",
    number: 1,
    name: "any_name",
  };
  tableRepositorySpy.tables = [
    {
      businessId: "any_business_id",
      id: "any_table_id",
      number: 1,
      name: "any_name",
    },
  ];
  return tableRepositorySpy;
};

const makeTableRepositoryWithError = () => {
  class TableRepositorySpy {
    findById() {
      throw new Error();
    }
    findAll() {
      throw new Error();
    }
  }

  return new TableRepositorySpy();
};

describe("Get Table Usecase", () => {
  describe("Without tableId", () => {
    test("Should return null if tables is invalid", async () => {
      const { sut, tableRepositorySpy } = makeSut();
      tableRepositorySpy.tables = null;

      const table = await sut.execute("any_business_id");
      expect(table).toBeNull();
    });

    test("Should call tableRepository.findAll with correct value", async () => {
      const { sut, tableRepositorySpy } = makeSut();

      await sut.execute("any_business_id");
      expect(tableRepositorySpy.businessId).toBe("any_business_id");
    });

    test("Should return an array of tables", async () => {
      const { sut } = makeSut();

      const tables = await sut.execute("any_business_id");
      expect(Array.isArray(tables)).toBe(true);
      expect(tables[0]).toEqual({
        id: "any_table_id",
        businessId: "any_business_id",
        number: 1,
        name: "any_name",
      });
    });
  });

  describe("With tableId", () => {
    test("Should return null if table is invalid", async () => {
      const { sut, tableRepositorySpy } = makeSut();
      tableRepositorySpy.table = null;

      const table = await sut.execute("any_business_id", "any_table_id");
      expect(table).toBeNull();
    });

    test("Should call tableRepository.findById with correct value", async () => {
      const { sut, tableRepositorySpy } = makeSut();

      await sut.execute("any_business_id", "any_table_id");
      expect(tableRepositorySpy.businessId).toBe("any_business_id");
      expect(tableRepositorySpy.tableId).toBe("any_table_id");
    });

    test("Should return table correctly", async () => {
      const { sut } = makeSut();

      const table = await sut.execute("any_business_id", "any_table_id");
      expect(table).toEqual({
        id: "any_table_id",
        businessId: "any_business_id",
        number: 1,
        name: "any_name",
      });
    });
  });

  test("Should throw if no businessId is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.execute(undefined, "any_table_id")).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetTableUseCase(),
      new GetTableUseCase({}),
      new GetTableUseCase({
        tableRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute("any_business_id", "any_table_id"),
      ).rejects.toThrow(TypeError);
      await expect(sut.execute("any_business_id")).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetTableUseCase({
        tableRepository: makeTableRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute("any_business_id", "any_table_id"),
      ).rejects.toThrow(new Error());
      await expect(sut.execute("any_business_id")).rejects.toThrow(new Error());
    }
  });
});

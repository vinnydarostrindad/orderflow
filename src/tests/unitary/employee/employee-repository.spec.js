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
    async query(queryObject) {
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
  describe("create Method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        businessId: "any_business_id",
        name: "any_name",
        role: "any_role",
        hashedPassword: "any_hash",
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
        role: "any_role",
        hashedPassword: "any_hash",
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        businessId: "any_business_id",
        role: "any_role",
        hashedPassword: "any_hash",
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("name"),
      );
    });

    test("Should throw if no role is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        businessId: "any_business_id",
        name: "any_name",
        hashedPassword: "any_hash",
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("role"),
      );
    });

    test("Should throw if no hashedPassword is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        businessId: "any_business_id",
        name: "any_name",
        role: "any_role",
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("hashedPassword"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_id",
        businessId: "any_business_id",
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
        values: [
          "any_id",
          "any_business_id",
          "any_name",
          "any_role",
          "any_hash",
        ],
      });
    });
  });

  describe("findAll method", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findAll()).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findAll("any_business_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          employees
        WHERE
          business_id = $1
        LIMIT
          10
      ;`,
        values: ["any_business_id"],
      });
    });

    test("Should return array correctly", async () => {
      const { sut } = makeSut();

      const employees = await sut.findAll("any_business_id");
      expect(Array.isArray(employees)).toBe(true);
    });
  });

  describe("findById method", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findById()).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no employeeId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findById("any_business_id")).rejects.toThrow(
        new MissingParamError("employeeId"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findById("any_business_id", "any_employee_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT 
          * 
        FROM 
          employees
        WHERE 
          id = $1 AND business_id = $2
        LIMIT 
          1
      ;`,
        values: ["any_employee_id", "any_business_id"],
      });
    });

    test("Should return employee correctly", async () => {
      const { sut } = makeSut();

      const employee = await sut.findById("any_business_id", "any_employee_id");
      expect(employee).toEqual({
        id: "any_id",
        business_id: "any_business_id",
        name: "any_name",
        role: "any_role",
        hashedPassword: "any_hash",
      });
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
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
      await expect(sut.findAll(props.businessId)).rejects.toThrow(TypeError);
      await expect(sut.findById(props.businessId, props.id)).rejects.toThrow(
        TypeError,
      );
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
      businessId: "any_business_id",
      name: "any_name",
      role: "any_role",
      hashedPassword: "any_hash",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow();
      await expect(sut.findAll(props.businessId)).rejects.toThrow();
      await expect(sut.findById(props.businessId, props.id)).rejects.toThrow();
    }
  });
});

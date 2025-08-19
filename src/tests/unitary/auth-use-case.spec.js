import MissingParamError from "../../utils/errors/missing-param-error.js";
import AuthUseCase from "../../domain/usecase/auth-usecase.js";
import InvalidParamError from "../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const jwtSpy = makeJwt();
  const sut = new AuthUseCase({ jwt: jwtSpy });
  return {
    sut,
    jwtSpy,
  };
};

const makeJwt = () => {
  const jwtSpy = {
    sign(obj, secret) {
      this.obj = obj;
      this.secret = secret;
      return this.token;
    },
  };

  jwtSpy.token = "any_token";
  return jwtSpy;
};

const makeJwtWithError = () => {
  const jwtWithErrorSpy = {
    sign() {
      throw new Error();
    },
  };

  return jwtWithErrorSpy;
};

const obj = {
  employeeId: "any_employee_id",
  role: "any_role",
  businessId: "any_business_id",
};

describe("Auth Usecase", () => {
  describe("generateToken method", () => {
    test("Should throw if no payload is provided", () => {
      const { sut } = makeSut();
      expect(() => sut.generateToken()).toThrow(
        new MissingParamError("payload"),
      );
    });

    test("Should throw if payload not an plain object", () => {
      const { sut } = makeSut();
      expect(() => sut.generateToken(["invalid", "payload"])).toThrow(
        new InvalidParamError("payload"),
      );
    });

    test("Should throw if payload is empty", () => {
      const { sut } = makeSut();
      expect(() => sut.generateToken({})).toThrow(
        new InvalidParamError("payload"),
      );
    });

    test("Should call jwt.sign with the correct values", () => {
      const { sut, jwtSpy } = makeSut();
      sut.generateToken(obj);
      expect(jwtSpy.obj).toMatchObject(obj);
      expect(jwtSpy.secret).toBe("secret");
    });

    test("Should return token correctly", () => {
      const { sut } = makeSut();
      const token = sut.generateToken(obj);
      expect(token).toBe("any_token");
    });

    test("Should throw if invalid dependencies are provided", () => {
      const suts = [
        new AuthUseCase(),
        new AuthUseCase({}),
        new AuthUseCase({
          jwt: {},
        }),
      ];

      for (const sut of suts) {
        expect(() => sut.generateToken(obj)).toThrow(TypeError);
      }
    });

    test("Should throw if dependencies throws", () => {
      const suts = [
        new AuthUseCase({
          jwt: makeJwtWithError(),
        }),
      ];

      for (const sut of suts) {
        expect(() => sut.generateToken(obj)).toThrow();
      }
    });
  });
});
